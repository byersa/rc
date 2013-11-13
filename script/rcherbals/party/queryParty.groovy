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
    Map <String, String> joinKeys = ['partyId':'partyId']
    String masterJoinAlias
    EntityDynamicView edv
    
    List<EntityConditionImplBase> condList = []
    EntityConditionFactory ecf = ec.entity.getConditionFactory()
    logger.info("queryParty, context: ${context}, masterJoinAlias: ${masterJoinAlias}, joinKeys: ${joinKeys}");
    
        this.masterJoinAlias = "PTY"
        ef = ec.entity.makeFind("Party")
        edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PTY", "Party", null, null, null)
        edv.addAliasAll("PTY", null)
            edv.addMemberEntity("ORG", "Organization", this.masterJoinAlias, true, ['partyId':'partyId'])
            edv.addAliasAll("ORG", null)
            edv.addMemberEntity("PERSN", "Person", this.masterJoinAlias, true, ['partyId':'partyId'])
            edv.addAliasAll("PERSN", null)

    if (context.toPartyId) {
        //this.masterJoinAlias = "PTYREL"
        //ef = ec.entity.makeFind("PartyRelationship")
        //edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PTYREL", "PartyRelationship", this.masterJoinAlias, null, ['fromPartyId':'partyId'])
        edv.addAliasAll(this.masterJoinAlias, null)
        
        // edv.addMemberEntity("PTY", "Party", this.masterJoinAlias, null, ['fromPartyId':'partyId'])
        // edv.addAliasAll("PTY", null)
    }
    ef.limit(context.limit)
    
    List<EntityConditionImplBase> orgOrPersonList = condList
    if (isOrganizationType && isPartyType) {
        orgOrPersonList = []
    }
    
    
    if (isOrganizationType && context.organizationName) {
            
            EntityConditionImplBase cond = ecf.makeCondition("organizationName", EntityCondition.EQUALS, context.organizationName)
            orgOrPersonList.push(cond)
        } 
    if (isPartyType && (context.lastName || context.firstName)) {
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
    
    // edv.addMemberEntity("PTY_CNTC_MECH", "PartyContactMech", this.masterJoinAlias, true, ['partyId':'partyId'])
    // edv.addAliasAll("PTY_CNTC_MECH", null)
    
    if (context.emailAddress) {
            edv.addMemberEntity("PTY_CNTC_MECH_EMAIL", "PartyContactMech", this.masterJoinAlias, true, ['partyId':'partyId'])
            edv.addAliasAll("PTY_CNTC_MECH_EMAIL", null)
            edv.addMemberEntity("CNTC_MECH", "ContactMech", "PTY_CNTC_MECH_EMAIL", true, ['contactMechId':'contactMechId'])
            edv.addAliasAll("CNTC_MECH", null)
            EntityConditionImplBase cond = ecf.makeCondition("infoString", EntityCondition.EQUALS, context.emailAddress)
            condList.push(cond)
        } 
        
    if (context.contactNumber) {
            edv.addMemberEntity("PTY_CNTC_MECH_PHONE", "PartyContactMech", this.masterJoinAlias, true, ['partyId':'partyId'])
            edv.addAliasAll("PTY_CNTC_MECH_PHONE", null)
            edv.addMemberEntity("TELECOM", "TelecomNumber", "PTY_CNTC_MECH_PHONE", true, ['contactMechId':'contactMechId'])
            edv.addAliasAll("TELECOM", null)
            EntityConditionImplBase cond = ecf.makeCondition("contactNumber", EntityCondition.EQUALS, context.contactNumber)
            condList.push(cond)
        } 

    if (context.city || context.stateProvinceGeoId || postalCode) {
            edv.addMemberEntity("PTY_CNTC_MECH_POSTAL", "PartyContactMech", this.masterJoinAlias, true, ['partyId':'partyId'])
            edv.addAliasAll("PTY_CNTC_MECH_POSTAL", null)
            edv.addMemberEntity("POSTAL", "PostalAddress", "PTY_CNTC_MECH_POSTAL", true, ['contactMechId':'contactMechId'])
            edv.addAliasAll("POSTAL", null)
            if (context.city) {
                EntityConditionImplBase cond = ecf.makeCondition("city", EntityCondition.EQUALS, context.city)
                condList.push(cond)
            }
            if (context.stateProvinceGeoId) {
                EntityConditionImplBase cond = ecf.makeCondition("stateProvinceGeoId", EntityCondition.EQUALS, context.stateProvinceGeoId)
                condList.push(cond)
            }
            if (context.postalCode) {
                EntityConditionImplBase cond = ecf.makeCondition("postalCode", EntityCondition.EQUALS, context.postalCode)
                condList.push(cond)
            }
        }
        
        
            List<Node> mbrnds = edv.getMemberEntityNodes()
            logger.info("queryParty, mbrnds(final): ${mbrnds}")
        logger.info("In: queryParty, query on Party and Organization, condList: ${condList}")
        List partyViewEntityList 
        if(condList.size) {
            EntityConditionImplBase entityListCond = ecf.makeCondition(condList)
            logger.info("In: queryParty, entityListCond: ${entityListCond}")
            partyViewEntityList = ef.condition(entityListCond).list()
        } else {
            partyViewEntityList = ef.list()
        }
        logger.info("In: queryParty, query on Party and Organization, partyViewEntityList(${partyViewEntityList.size()}: ${partyViewEntityList}")
    List <EntityValue> partyListJson = new ArrayList()

    partyViewEntityList.each {party ->
        Map partyMap = ["partyId": party.partyId, "partyTypeEnumId": party.partyTypeEnumId]
        EntityValue person, org
        if (party.partyTypeEnumId == "PtyPerson") {
            //person = ec.entity.makeFind("Person").condition(["partyId": party.partyId]).one()
            partyMap["fullName"] = party.firstName + " " + party.lastName
        }
        if (party.partyTypeEnumId == "PtyOrganization") {
            //org = ec.entity.makeFind("Organization").condition(["partyId": party.partyId]).one()
            partyMap["fullName"] = party.organizationName
        }
        partyListJson.push(partyMap)
    }
    Map <String, Object> result = new HashMap()
    result.items = partyListJson
    return result
