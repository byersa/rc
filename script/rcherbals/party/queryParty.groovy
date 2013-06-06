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

    String partyTypeEnumId = context.partyTypeEnumId
    String firstName = context.firstName
    String lastName = context.lastName
    String organizationName = context.organizationName
    String emailAddress = context.emailAddress
    String phoneNumber = context.phoneNumber
    String city = context.city
    String state = context.state
    
    logger.info("partyTypeEnumId: ${partyTypeEnumId}")
    logger.info("lastName: ${lastName}")
    logger.info("organizationName: ${organizationName}")
    logger.info("emailAddress: ${emailAddress}")
        EntityFind ef = ec.entity.makeFind("Party")
        EntityDynamicView edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PRTY", "Party", null, null, null)
        edv.addAliasAll("PRTY", null)
        
        List<EntityConditionImplBase> condList = []
        EntityConditionFactory ecf = ec.entity.getConditionFactory()
        if (partyTypeEnumId == 'ORGANIZATION') {
            edv.addMemberEntity("ORG", "Organization", "PRTY", null, ['partyId':'partyId'])
            edv.addAliasAll("ORG", null)
            if (organizationName) {
                EntityConditionImplBase cond = ecf.makeCondition("organizationName", EntityCondition.EQUALS, organizationName)
                condList.push(cond)
            }
        } else {
            edv.addMemberEntity("PERSN", "Person", "PRTY", null, ['partyId':'partyId'])
            edv.addAliasAll("PERSN", null)
            if (lastName) {
                EntityConditionImplBase cond = ecf.makeCondition("lastName", EntityCondition.EQUALS, lastName)
                condList.push(cond)
            }
            if (firstName) {
                EntityConditionImplBase cond = ecf.makeCondition("firstName", EntityCondition.EQUALS, firstName)
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
