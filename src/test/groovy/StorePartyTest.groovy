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

    def setupSpec() {
        logger.info("In: StorePartyTest, setupSpec")
        ec = Moqui.getExecutionContext()
        logger.info("ec: ${ec}")
        logger.info("ec.entity: ${ec.entity}")
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
            def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters([
                 partyId:_partyId, partyTypeEnumId:_partyTypeEnumId, 
                 organizationName:_organizationName, 
                 firstName:_firstName, lastName:_lastName,
                 address1:_address1, city:_city, stateProvinceGeoId:_stateProvinceGeoId, postalCode: _postalCode,
                 areaCode: _areaCode, contactNumber: _contactNumber,
                 emailAddress: _emailAddress,
                 postalContactMechId: _postalContactMechId, telecomContactMechId: _telecomContactMechId, emailContactMechId: _emailContactMechId
                 ]).call()
                 
            logger.info("createResultService: ${createResultService}")
            EntityValue org = ec.entity.makeFind("Organization").condition("partyId", createResultService.partyId).one()
            logger.info("org: ${org}")
            org.organizationName == _organizationName
                 
        where:
        _partyId | _partyTypeEnumId | _organizationName | _firstName | _lastName | _address1 | _city | _stateProvinceGeoId | _postalCode | _areaCode | _contactNumber | _emailAddress | _postalContactMechId | _telecomContactMechId | _emailContactMechId 
        null     | "ORGANIZATION"   | "ABC Co"          | null       | null      | null      | null  | null                | null        | null      | null           | null          | null                 | null                  | null         
    }
    
    def "create Person and email "() {
        expect:
            def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters([
                 partyId:_partyId, partyTypeEnumId:_partyTypeEnumId, 
                 organizationName:_organizationName, 
                 firstName:_firstName, lastName:_lastName,
                 address1:_address1, city:_city, stateProvinceGeoId:_stateProvinceGeoId, postalCode: _postalCode,
                 areaCode: _areaCode, contactNumber: _contactNumber,
                 emailAddress: _emailAddress,
                 postalContactMechId: _postalContactMechId, telecomContactMechId: _telecomContactMechId, emailContactMechId: _emailContactMechId
                 ]).call()
                 
            logger.info("createResultService: ${createResultService}")
            EntityValue person = ec.entity.makeFind("Person").condition("partyId", createResultService.partyId).one()
            logger.info("person: ${person}")
            person.lastName == _lastName
            EntityValue contactMech = ec.entity.makeFind("ContactMech").condition("contactMechId", createResultService.emailContactMechId).one()
            logger.info("contactMech: ${contactMech}")
            contactMech.infoString == _emailAddress
                 
        where:
        _partyId | _partyTypeEnumId | _organizationName | _firstName | _lastName | _address1 | _city | _stateProvinceGeoId | _postalCode | _areaCode | _contactNumber | _emailAddress    | _postalContactMechId | _telecomContactMechId | _emailContactMechId 
        null     | "PERSON"         | null              | "Mary"       | "Doe"   | null      | null  | null                | null        | null      | null           | "mdoe@gmail.com" | null                 | null                  | null         
    }
}