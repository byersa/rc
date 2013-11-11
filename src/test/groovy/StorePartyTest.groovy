import spock.lang.*;

import org.moqui.context.ExecutionContext
import org.moqui.entity.EntityValue
import org.moqui.entity.EntityFind
import org.moqui.entity.EntityDynamicView
import org.moqui.Moqui
import org.moqui.context.ResourceReference
import org.moqui.entity.EntityConditionFactory
import org.moqui.entity.EntityCondition
import org.moqui.entity.EntityCondition.JoinOperator
import org.moqui.entity.EntityCondition.ComparisonOperator
import org.moqui.impl.entity.condition.EntityConditionImplBase
import org.moqui.impl.entity.condition.BasicJoinCondition
import org.moqui.impl.entity.condition.FieldValueCondition
import org.moqui.impl.entity.condition.ConditionField
import org.moqui.impl.entity.condition.DateCondition
import org.moqui.impl.entity.condition.WhereCondition
import org.moqui.impl.entity.condition.FieldToFieldCondition
import org.moqui.impl.entity.condition.ListCondition
import org.moqui.impl.entity.condition.MapCondition
import org.moqui.impl.StupidUtilities


class StorePartyTest extends Specification {

    protected final static org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(StorePartyTest.class)

    @Shared
    ExecutionContext ec

    @Shared
    List returnedPostalItems

    @Shared
    List returnedEmailItems

    @Shared
    List returnedPhoneItems

    def setupSpec() {
        logger.info("In: StorePartyTest, setupSpec")
        ec = Moqui.getExecutionContext()
        logger.info("ec: ${ec}")
        logger.info("ec.entity: ${ec.entity}")
        ec.user.loginUser("rcadmin", "moqui", null)
        returnedPostalItems = []
        returnedEmailItems = []
        returnedPhoneItems = []
    }

    def cleanupSpec() {
        logger.info("In: StorePartyTest, cleanupSpec")
        ec.destroy()
    }

    def setup() {
        logger.info("In: StorePartyTest, setup")
        ec.artifactExecution.disableAuthz()
    }

    def cleanup() {
        logger.info("In: StorePartyTest, cleanup")
        ec.artifactExecution.enableAuthz()
    }

    def "create Organization only"() {
        expect:
            logger.info("createResultService, _organizationName: ${_organizationName}, _partyTypeEnumId: ${_partyTypeEnumId}")
            def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters([
                 partyId:_partyId, partyTypeEnumId:_partyTypeEnumId, 
                 organizationName:_organizationName
                 ]).call()
                 
            logger.info("createResultService: ${createResultService}")
            List items = createResultService.items
            logger.info("items: ${items}")
            Map item = items[0]
            logger.info("item: ${item}")
            EntityValue org = ec.entity.makeFind("Organization").condition("partyId", item.partyId).one()
            logger.info("org: ${org}")
            def deleteResultService = ec.service.sync().name("rcherbals.PartyServices.deleteParty").parameters([
                 partyId:item.partyId
                 ]).call()
            org.organizationName == _organizationName
                 
        where:
        _partyId | _partyTypeEnumId | _organizationName 
        null     | "PtyOrganization"   | "ABC Company"          
    }
    
    def "create Person only"() {
        expect:
            logger.info("createResultService (Person), _firstName: ${_firstName}, _lastName: ${_lastName}")
            def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters([
                 partyId:_partyId, partyTypeEnumId:_partyTypeEnumId, 
                 firstName:_firstName,
                 lastName:_lastName,
                 middleName:_middleName,
                 ]).call()
                 
            logger.info("createResultService (Person): ${createResultService}")
            List items = createResultService.items
            logger.info("items (Person): ${items}")
            Map item = items[0]
            logger.info("item (Person): ${item}")
            EntityValue person = ec.entity.makeFind("Person").condition("partyId", item.partyId).one()
            logger.info("person: ${person}")
            def deleteResultService = ec.service.sync().name("rcherbals.PartyServices.deleteParty").parameters([
                 partyId:item.partyId
                 ]).call()
                 
        where:
        _partyId | _partyTypeEnumId | _firstName | _middleName | _lastName
        null     | "PtyPerson"   | "Dudley" | "M" | "Dooright"        
    }
    
    // def "create Person and email "() {
    //     expect:
    //         logger.info("createResultService, _organizationName: ${_organizationName}, _partyTypeEnumId: ${_partyTypeEnumId}")
    //         def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters([
    //              partyId:_partyId, partyTypeEnumId:_partyTypeEnumId, 
    //              organizationName:_organizationName,
    //              emailData: emailList
    //              ]).call()
                 
    //         logger.info("createResultService: ${createResultService}")
    //         List items = createResultService.items
    //         logger.info("items: ${items}")
    //         Map item = items[0]
    //         logger.info("item: ${item}")
    //         EntityValue org = ec.entity.makeFind("Organization").condition("partyId", item.partyId).one()
    //         logger.info("org: ${org}")
    //         def deleteResultService = ec.service.sync().name("rcherbals.PartyServices.deleteParty").parameters([
    //              partyId:item.partyId
    //              ]).call()
    //         org.organizationName == _organizationName
                 
    //     where:
    //     _partyId | _partyTypeEnumId | _organizationName | _email_one | _email_two
    //     null     | "PtyOrganization" | "ABC Company" | "one@gmail.com" | "two@gmail.com"
        
    //}
    
     def "create postal "() {
        expect:
            logger.info("createResultService (postal), organizationName: ${_organizationName}, address1: ${_address1}, city: ${_city}, stateProvinceGeoId: ${_stateProvinceGeoId}, postalCode: ${_postalCode}")
            List postalList = [[contactMechPurposeId: _contactMechPurposeId, address1: _address1, city: _city, stateProvinceGeoId: _stateProvinceGeoId, postalCode: _postalCode]]
            if (_address12 || _city2  || _stateProvinceGeoId2 || _postalCode2) {
                Map secondAddress = [contactMechPurposeId: _contactMechPurposeId2, address1: _address12, city: _city2, stateProvinceGeoId: _stateProvinceGeoId2, postalCode: _postalCode2]
                postalList.push(secondAddress)
            }
            logger.info("createResultService (postal), postalList: ${postalList}")
            def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters([
                 partyId:_partyId, partyTypeEnumId:_partyTypeEnumId, 
                 organizationName:_organizationName,
                 postalData: postalList
                 ]).call()
                 
            logger.info("createResultService (postal): ${createResultService}")
            List items = createResultService.items
            logger.info("items (postal): ${items}")
            Map item = items[0]
            logger.info("item (postal): ${item}")
            returnedPostalItems.push(item)
            logger.info("returnedPostalItems (postal): ${returnedPostalItems}")
            String contactMechId = item.postalData[0]["contactMechId"]
            EntityValue postalAddress = ec.entity.makeFind("PostalAddress").condition("contactMechId", contactMechId).one()
            logger.info("postalAddress (postal): ${postalAddress}")
            postalAddress.contactMechId == contactMechId
                 
        where:
        _partyId | _partyTypeEnumId | _organizationName | _contactMechPurposeId | _address1 | _city | _stateProvinceGeoId | _postalCode |  _contactMechPurposeId2 | _address12 | _city2 | _stateProvinceGeoId2 | _postalCode2 
        null     | "PtyOrganization" | "ABC Company" | "PostalShippingOrigin" | "809 Ellison" | "Waynesboro" | "USA_VA" | "22980" | "PostalPrimary" | "123 Main St" | "Pittsburgh" | "USA_PA" | "99832"
        null     | "PtyOrganization" | "ZYZ Company" | "PostalShippingDest" | "809 Ashby" | "Mt. Lebanon" | "USA_VA" | "15228" | null | null | null | null | null
     }
     
     def "update postal"() {
            when:
                Map row = returnedPostalItems[0]
                logger.info("update postal, row: ${row}")
                Map postal1 = row.postalData[0]
                String origAddress1 = postal1.address1 = postal1.address1 + "XYZ"
                def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters(row).call()
                     
                logger.info("createResultService (update postal): ${createResultService}")
                List items = createResultService.items
                logger.info("items (update postal): ${items}")
                Map item = items[0]
                logger.info("item (update postal): ${item}")
                Map postal2 = item.postalData[0]
                String updatedAddress1 = postal2.address1
                logger.info("update postal, origAddress1: ${origAddress1}, updatedAddress1: ${updatedAddress1}")
                def deleteResultService = ec.service.sync().name("rcherbals.PartyServices.deleteParty").parameters([
                    partyId:item.partyId
                 ]).call()
           then:
                origAddress1 == updatedAddress1
     }
     
     def "create email "() {
        expect:
            logger.info("createResultService (email), organizationName: ${_organizationName}, infoString: ${_infoString}")
            List emailList = [[contactMechPurposeId: _contactMechPurposeId, infoString: _infoString]]
            logger.info("createResultService (email), emailList: ${emailList}")
            def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters([
                 partyId:_partyId, partyTypeEnumId:_partyTypeEnumId, 
                 organizationName:_organizationName,
                 emailData: emailList
                 ]).call()
                 
            logger.info("createResultService (email): ${createResultService}")
            List items = createResultService.items
            logger.info("items (email): ${items}")
            Map item = items[0]
            logger.info("item (email): ${item}")
            returnedEmailItems.push(item)
            logger.info("returnedEmailItems (email): ${returnedEmailItems}")
            String contactMechId = item.emailData[0]["contactMechId"]
            EntityValue emailAddress = ec.entity.makeFind("ContactMech").condition("contactMechId", contactMechId).one()
            logger.info("emailAddress (email): ${emailAddress}")
            emailAddress.contactMechId == contactMechId
                 
        where:
        _partyId | _partyTypeEnumId | _organizationName | _contactMechPurposeId | _infoString 
        null     | "PtyOrganization" | "ABCE Company" | "EmailPrimary" | "byersa2@gmail.com" 
        null     | "PtyOrganization" | "ZYZE Company" | "EmailOther" | "byersa3@gmail.com" 
     }
     
     def "update email"() {
            when:
                Map row = returnedEmailItems[0]
                logger.info("update email, row: ${row}")
                Map email1 = row.emailData[0]
                String origAddress1 = email1.infoString = email1.infoString + "XYZ"
                def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters(row).call()
                     
                logger.info("createResultService (update email): ${createResultService}")
                List items = createResultService.items
                logger.info("items (update email): ${items}")
                Map item = items[0]
                logger.info("item (update email): ${item}")
                Map email2 = item.emailData[0]
                String updatedAddress1 = email2.infoString
                logger.info("update email, origAddress1: ${origAddress1}, updatedAddress1: ${updatedAddress1}")
                def deleteResultService = ec.service.sync().name("rcherbals.PartyServices.deleteParty").parameters([
                    partyId:item.partyId
                 ]).call()
           then:
                origAddress1 == updatedAddress1
     }
     
     def "create phone "() {
        expect:
            logger.info("createResultService (phone), organizationName: ${_organizationName}, contactNumber: ${_contactNumber}")
            List phoneList = [[contactMechPurposeId: _contactMechPurposeId, contactNumber: _contactNumber]]
            logger.info("createResultService (phone), phoneList: ${phoneList}")
            def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters([
                 partyId:_partyId, partyTypeEnumId:_partyTypeEnumId, 
                 organizationName:_organizationName,
                 phoneData: phoneList
                 ]).call()
                 
            logger.info("createResultService (phone): ${createResultService}")
            List items = createResultService.items
            logger.info("items (phone): ${items}")
            Map item = items[0]
            logger.info("item (phone): ${item}")
            returnedPhoneItems.push(item)
            logger.info("returnedPhoneItems (phone): ${returnedPhoneItems}")
            String contactMechId = item.phoneData[0]["contactMechId"]
            EntityValue telecomNumber = ec.entity.makeFind("TelecomNumber").condition("contactMechId", contactMechId).one()
            logger.info("telecomNumber (phone): ${telecomNumber}")
            telecomNumber.contactMechId == contactMechId
                 
        where:
        _partyId | _partyTypeEnumId | _organizationName | _contactMechPurposeId | _contactNumber 
        null     | "PtyOrganization" | "ABCP Company" | "PhonePrimary" | "555-555-1212" 
        null     | "PtyOrganization" | "ZYZP Company" | "PhoneWork" | "888-555-1212" 
     }
     
     def "update phone"() {
            when:
                Map row = returnedPhoneItems[0]
                logger.info("update phone, row: ${row}")
                Map phone1 = row.phoneData[0]
                String origAddress1 = phone1.contactNumber = phone1.contactNumber.substring(8) + "4321"
                def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters(row).call()
                     
                logger.info("createResultService (update phone): ${createResultService}")
                List items = createResultService.items
                logger.info("items (update phone): ${items}")
                Map item = items[0]
                logger.info("item (update phone): ${item}")
                Map phone2 = item.phoneData[0]
                String updatedAddress1 = phone2.infoString
                logger.info("update phone, origAddress1: ${origAddress1}, updatedAddress1: ${updatedAddress1}")
                def deleteResultService = ec.service.sync().name("rcherbals.PartyServices.deleteParty").parameters([
                    partyId:item.partyId
                 ]).call()
           then:
                origAddress1 == updatedAddress1
     }
}