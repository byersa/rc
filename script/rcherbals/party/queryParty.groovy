import org.moqui.impl.entity.EntityDefinition
import org.moqui.impl.entity.EntityFacadeImpl
import org.moqui.entity.EntityFind
import org.moqui.entity.EntityDynamicView
import org.moqui.impl.entity.EntityFindImpl
import org.moqui.entity.EntityValue
import org.moqui.impl.entity.EntityValueImpl
import org.moqui.entity.EntityList
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

    org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("queryParty.groovy")

    //def ddf = ec.entity.datasourceFactoryByGroupMap.get("transactional_nosql")
    //logger.info("TEST1 ddf: ${ddf}")
    ec.artifactExecution.disableAuthz()

    
    logger.info("context: ${context}")
    EntityFind ef
    Map <String, String> joinKeys = ['partyId':'partyId']
    String masterJoinAlias
    EntityDynamicView edv
    Boolean isPersonType=false, isOrganizationType=false
    
    List<EntityConditionImplBase> condList = []
    EntityConditionFactory ecf = ec.entity.getConditionFactory()
    logger.info("queryParty, context: ${context}, masterJoinAlias: ${masterJoinAlias}, joinKeys: ${joinKeys}");
    
        this.masterJoinAlias = "PTY"
        ef = ec.entity.makeFind("Party")
        edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PTY", "Party", null, null, null)
        edv.addAliasAll("PTY", null)
    if (context.partyTypeEnumId == "PtyOrganization") {
            edv.addMemberEntity("ORG", "Organization", this.masterJoinAlias, false, ['partyId':'partyId'])
            edv.addAliasAll("ORG", null)
            isOrganizationType = true
    }
    if (context.partyTypeEnumId == "PtyPerson") {
            edv.addMemberEntity("PERSN", "Person", this.masterJoinAlias, false, ['partyId':'partyId'])
            edv.addAliasAll("PERSN", null)
            isPersonType = true
    }

    if (context.toPartyId) {
        //this.masterJoinAlias = "PTYREL"
        //ef = ec.entity.makeFind("PartyRelationship")
        //edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PTYREL", "PartyRelationship", this.masterJoinAlias, false, ['partyId':'fromPartyId'])
        edv.addAliasAll("PTYREL", "ptyrel")
        
        EntityConditionImplBase cond = ecf.makeCondition("ptyrelToPartyId", EntityCondition.EQUALS, context.toPartyId)
        condList.push(cond)
        // EntityConditionImplBase condDate = ecf.makeConditionDate("ptyrelFromDate", "ptyrelThruDate", null)
        // condList.push(condDate)
    }
    ef.limit(context.limit)
    
    List<EntityConditionImplBase> orgOrPersonList = condList
    if (isOrganizationType && isPartyType) {
        orgOrPersonList = []
    }
    
    
    if (isOrganizationType) {
            
            EntityConditionImplBase cond = ecf.makeCondition("partyTypeEnumId", EntityCondition.EQUALS, "PtyOrganization")
            orgOrPersonList.push(cond)
        } 
    if (isPersonType) {
            
            EntityConditionImplBase cond = ecf.makeCondition("partyTypeEnumId", EntityCondition.EQUALS, "PtyPerson")
            orgOrPersonList.push(cond)
        } 
    if (isOrganizationType && context.organizationName) {
            
            EntityConditionImplBase cond = ecf.makeCondition("organizationName", EntityCondition.LIKE, context.organizationName)
            orgOrPersonList.push(cond)
        } 
    if (isPartyType && (context.lastName || context.firstName)) {
            if (context.lastName) {
                EntityConditionImplBase cond = ecf.makeCondition("lastName", EntityCondition.LIKE, context.lastName)
                orgOrPersonList.push(cond)
            }
            if (context.firstName) {
                EntityConditionImplBase cond = ecf.makeCondition("firstName", EntityCondition.LIKE, context.firstName)
                orgOrPersonList.push(cond)
            }
        }
        
    if (context.isOrganizationType && context.isPartyType) {
        EntityConditionImplBase cond = ecf.makeCondition(orgOrPersonList, JoinOperator.OR)
        condList.push(cond)
    }
    
    // edv.addMemberEntity("PTY_CNTC_MECH", "PartyContactMech", this.masterJoinAlias, true, ['partyId':'partyId'])
    // edv.addAliasAll("PTY_CNTC_MECH", null)
    
    if (context.emailAddress) {
            edv.addMemberEntity("PTY_CNTC_MECH_EMAIL", "PartyContactMech", this.masterJoinAlias, false, ['partyId':'partyId'])
            edv.addAliasAll("PTY_CNTC_MECH_EMAIL", "emailCntct")
            edv.addMemberEntity("CNTC_MECH", "ContactMech", "PTY_CNTC_MECH_EMAIL", true, ['contactMechId':'contactMechId'])
            edv.addAliasAll("CNTC_MECH", null)
            EntityConditionImplBase cond = ecf.makeCondition("emailInfoString", EntityCondition.LIKE, context.emailAddress)
            condList.push(cond)
        } 
        
    if (context.contactNumber) {
            edv.addMemberEntity("PTY_CNTC_MECH_PHONE", "PartyContactMech", this.masterJoinAlias, false, ['partyId':'partyId'])
            edv.addAliasAll("PTY_CNTC_MECH_PHONE",  "telecomCntct")
            edv.addMemberEntity("TELECOM", "TelecomNumber", "PTY_CNTC_MECH_PHONE", true, ['contactMechId':'contactMechId'])
            edv.addAliasAll("TELECOM", null)
            EntityConditionImplBase cond = ecf.makeCondition("contactNumber", EntityCondition.LIKE, context.contactNumber)
            condList.push(cond)
        } 

    if (context.city || context.stateProvinceGeoId || postalCode) {
            edv.addMemberEntity("PTY_CNTC_MECH_POSTAL", "PartyContactMech", this.masterJoinAlias, false, ['partyId':'partyId'])
            edv.addAliasAll("PTY_CNTC_MECH_POSTAL", "postalCntct")
            edv.addMemberEntity("POSTAL", "PostalAddress", "PTY_CNTC_MECH_POSTAL", false, ['contactMechId':'contactMechId'])
            edv.addAliasAll("POSTAL", null)
            if (context.city) {
                EntityConditionImplBase cond = ecf.makeCondition("city", EntityCondition.LIKE, context.city)
                condList.push(cond)
            }
            if (context.stateProvinceGeoId) {
                EntityConditionImplBase cond = ecf.makeCondition("stateProvinceGeoId", EntityCondition.LIKE, context.stateProvinceGeoId)
                condList.push(cond)
            }
            if (context.postalCode) {
                EntityConditionImplBase cond = ecf.makeCondition("postalCode", EntityCondition.LIKE, context.postalCode)
                condList.push(cond)
            }
        }
        
        
            List<Node> mbrnds = edv.getMemberEntityNodes()
            logger.info("queryParty, mbrnds(final): ${mbrnds}")
        logger.info("In: queryParty, query on Party and Organization, condList: ${condList}")
        EntityList partyViewEntityList 
        if(condList.size) {
            EntityConditionImplBase entityListCond = ecf.makeCondition(condList)
            logger.info("In: queryParty, entityListCond: ${entityListCond}")
            ef.condition(entityListCond)
            //def whereCond = ef.getWhereEntityCondition()
            //logger.info("queryParty, whereCond: ${whereCond}")
            partyViewEntityList = ef.list()
        } else {
            partyViewEntityList = ef.list()
        }        
        logger.info("In: queryParty, query on Party and Organization, partyViewEntityList(${partyViewEntityList.size()}: ${partyViewEntityList}")
    EntityList filteredList = partyViewEntityList.filterByDate("ptyrelFromDate", "ptyrelThruDate", null)
    if (context.emailAddress) { filteredList = filteredList.filterByDate("emailCntctFromDate", "emailCntctThruDate", null) }
    if (context.contactNumber) { filteredList = filteredList.filterByDate("telecomCntctFromDate", "telecomCntctThruDate", null) }
    if (context.city || context.stateProvinceGeoId || postalCode) { filteredList = filteredList.filterByDate("postalCntctFromDate", "postalCntctThruDate", null) }
        logger.info("In: queryParty, query on Party and Organization, filteredList(${filteredList.size()}: ${filteredList}")
    List <EntityValue> partyListJson = new ArrayList()

    filteredList.each {party ->
        Map partyMap = ["partyId": party.partyId, "partyTypeEnumId": party.partyTypeEnumId]
        EntityValue person, org
        if (party.partyTypeEnumId == "PtyPerson") {
            //person = ec.entity.makeFind("Person").condition(["partyId": party.partyId]).one()
            //partyMap["fullName"] = party.firstName + " " + party.lastName
            partyMap["firstName"] = party.firstName
            partyMap["lastName"] = party.lastName
        }
        if (party.partyTypeEnumId == "PtyOrganization") {
            //org = ec.entity.makeFind("Organization").condition(["partyId": party.partyId]).one()
            //partyMap["fullName"] = party.organizationName
            partyMap["organizationName"] = party.organizationName

        }
        List <EntityValue> partyMapList = ec.entity.makeFind("PartyContactMech").condition("partyId", party.partyId).list()
        partyMapList.each() {partyContactMech ->
            switch(partyContactMech.contactMechPurposeId){
                case ["PhonePrimary","PhoneShippingOrigin","PhoneShippingDest"]:
                    List <EntityValue> phoneList = ec.entity.makeFind("TelecomNumber").condition("contactMechId", partyContactMech.contactMechId).list()
                    if (phoneList.size()) {
                        List phoneData = []
                        phoneList.each() {telecomNumber ->
                             phoneData.push([contactMechId: telecomNumber.contactMechId, contactMechPurposeId:partyContactMech.contactMechPurposeId, \
                                             contactNumber: telecomNumber.contactNumber, fromDate: partyContactMech.fromDate, thruDate:partyContactMech.thruDate]) 
                        }
                        partyMap["phoneData"] = phoneData
                    }
                    break;
                case ["PostalPrimary","PostalGeneral"]:
                    List <EntityValue> postalList = ec.entity.makeFind("PostalAddress").condition("contactMechId", partyContactMech.contactMechId).list()
                    if (postalList.size()) {
                        List postalData = []
                        postalList.each() {postalAddress ->
                             postalData.push([contactMechId: partyContactMech.contactMechId, contactMechPurposeId:partyContactMech.contactMechPurposeId, \
                                            fromDate: partyContactMech.fromDate, thruDate:partyContactMech.thruDate, \
                                             address1: postalAddress.address1, address2: postalAddress.address2, \
                                             city: postalAddress.city, stateProvinceGeoId: postalAddress.stateProvinceGeoId, postalCode: postalAddress.postalCode \
                                             ]) 
                        }
                        partyMap["postalData"] = postalData
                    }
                    break;
                case ["EmailPrimary","EmailOther"]:
                    List <EntityValue> emailList = ec.entity.makeFind("ContactMech").condition("contactMechId", partyContactMech.contactMechId).list()
                    if (emailList.size()) {
                        List emailData = []
                        emailList.each() {emailAddress ->
                             emailData.push([contactMechId: partyContactMech.contactMechId, contactMechPurposeId:partyContactMech.contactMechPurposeId, \
                                            fromDate: partyContactMech.fromDate, thruDate:partyContactMech.thruDate, \
                                             infoString: emailAddress.infoString \
                                             ]) 
                        }
                        partyMap["emailData"] = emailData
                    }
                    break;
                default:
                    break;
            }
        }
        partyListJson.push(partyMap)
    }
        logger.info("In: queryParty, partyListJson: ${partyListJson}")
    //Map <String, Object> result = new HashMap()
    result.items = partyListJson
    return result
