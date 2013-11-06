import org.moqui.impl.entity.EntityDefinition
import org.moqui.impl.entity.EntityFacadeImpl
import org.moqui.entity.EntityFind
import org.moqui.entity.EntityDynamicView
import org.moqui.impl.entity.EntityFindImpl
import org.moqui.entity.EntityValue
import org.moqui.impl.entity.EntityValueImpl
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
    Map joinKeys
    String masterJoinAlias
    
    List<EntityConditionImplBase> condList = []
    EntityConditionFactory ecf = ec.entity.getConditionFactory()
    
    if (!context.toPartyId) {
        ef = ec.entity.makeFind("Party")
        EntityDynamicView edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PRTY", "Party", null, null, null)
        edv.addAliasAll("PRTY", null)
        joinKeys = ['partyId':'partyId']
        masterJoinAlias = "PRTY"
    } else {
        ef = ec.entity.makeFind("PartyRelationship")
        EntityDynamicView edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PRTYREL", "PartyRelationship", null, null, null)
        edv.addAliasAll("PRTYREL", null)
        joinKeys = ['fromPartyId':'partyId']
        masterJoinAlias = "PRTYREL"
    }
        
    List<EntityConditionImplBase> orgOrPersonList = condList
    if (isOrganizationType && isPartyType) {
        orgOrPersonList = []
    }
    
    if (isOrganizationType && context.organizationName) {
            edv.addMemberEntity("ORG", "Organization", masterJoinAlias, null, joinKeys)
            edv.addAliasAll("ORG", null)
            EntityConditionImplBase cond = ecf.makeCondition("organizationName", EntityCondition.EQUALS, context.organizationName)
            orgOrPersonList.push(cond)
        } 
    if (isPartyType && (context.lastName || context.firstName)) {
            edv.addMemberEntity("PERSN", "Person", masterJoinAlias, null, joinKeys)
            edv.addAliasAll("PERSN", null)
            if (context.lastName) {
                EntityConditionImplBase cond = ecf.makeCondition("lastName", EntityCondition.EQUALS, context.lastName)
                orgOrPersonList.push(cond)
            }
            if (context.firstName) {
                EntityConditionImplBase cond = ecf.makeCondition("firstName", EntityCondition.EQUALS, context.firstName)
                orgOrPersonList.push(cond)
            }
        }
        
    if (context.isOrganizationType && context.isPartyType) {
        EntityConditionImplBase cond = ecf.makeCondition(orgOrPersonList, JoinOperator.OR)
        condList.push(cond)
    }
    
    if (context.emailAddress) {
            edv.addMemberEntity("PRTY_CNTC_MECH", "PartyContactMech", masterJoinAlias, null, joinKeys)
            edv.addAliasAll("PRTY_CNTC_MECH", null)
            edv.addMemberEntity("CNTC_MECH", "ContactMech", "PRTY_CNTC_MECH", null, ['contactMechId':'contactMechId'])
            EntityConditionImplBase cond = ecf.makeCondition("infoString", EntityCondition.EQUALS, context.emailAddress)
            condList.push(cond)
        } 
        
    if (context.phoneNumber) {
            edv.addMemberEntity("PRTY_CNTC_MECH", "PartyContactMech", masterJoinAlias, null, joinKeys)
            edv.addAliasAll("PRTY_CNTC_MECH", null)
            edv.addMemberEntity("TELECOM", "TelecomNumber", "PRTY_CNTC_MECH", null, ['contactMechId':'contactMechId'])
            EntityConditionImplBase cond = ecf.makeCondition("contactNumber", EntityCondition.EQUALS, context.phoneNumber)
            condList.push(cond)
        } 

    if (context.city || context.stateProvinceGeoId || postalCode) {
            edv.addMemberEntity("PRTY_CNTC_MECH", "PartyContactMech", masterJoinAlias, null, joinKeys)
            edv.addAliasAll("PRTY_CNTC_MECH", null)
            edv.addMemberEntity("POSTAL", "Person", "PRTY_CNTC_MECH", null, ['contactMechId':'contactMechId'])
            edv.addAliasAll("POSTAL", null)
            if (context.city) {
                EntityConditionImplBase cond = ecf.makeCondition("lastName", EntityCondition.EQUALS, context.city)
                condList.push(cond)
            }
            if (context.stateProvinceGeoId) {
                EntityConditionImplBase cond = ecf.makeCondition("firstName", EntityCondition.EQUALS, context.stateProvinceGeoId)
                condList.push(cond)
            }
            if (context.postalCode) {
                EntityConditionImplBase cond = ecf.makeCondition("firstName", EntityCondition.EQUALS, context.postalCode)
                condList.push(cond)
            }
        }
        
        
        List partyViewEntityList 
        if(condList.size) {
            EntityConditionImplBase entityListCond = ecf.makeCondition(condList)
            partyViewEntityList = ef.condition(entityListCond).list()
        } else {
            partyViewEntityList = ef.list()
        }
        logger.info("In: DynamicViewTest, query on Party and Organization, partyViewEntityList: ${partyViewEntityList}")
    List <EntityValue> partyListJson = new ArrayList()

    partyViewEntityList.each {party ->
        Map partyMap = ["partyId": party.partyId, "partyTypeEnumId": party.partyTypeEnumId]
        EntityValue person, org
        if (party.partyTypeEnumId == "PERSON") {
            //person = ec.entity.makeFind("Person").condition(["partyId": party.partyId]).one()
            partyMap["fullName"] = party.firstName + " " + party.lastName
        } else {
            //org = ec.entity.makeFind("Organization").condition(["partyId": party.partyId]).one()
            partyMap["fullName"] = party.organizationName
        }
        partyListJson.push(partyMap)
    }
    /*
    List <EntityValue> partyList = ec.entity.makeFind("Party").list()
    logger.info("partyList: ${partyList}")
    List <EntityValue> partyListJson = new ArrayList()


    partyList.each {party ->
        Map partyMap = ["partyId": party.partyId, "partyTypeEnumId": party.partyTypeEnumId]
        EntityValue person, org
        if (party.partyTypeEnumId == "PERSON") {
            person = ec.entity.makeFind("Person").condition(["partyId": party.partyId]).one()
            partyMap["fullName"] = person.firstName + " " + person.lastName
        } else {
            org = ec.entity.makeFind("Organization").condition(["partyId": party.partyId]).one()
            partyMap["fullName"] = org.organizationName
        }
        partyListJson.push(partyMap)
    }
    */
    Map <String, Object> result = new HashMap()
    result.items = partyListJson
    return result
