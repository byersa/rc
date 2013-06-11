import org.moqui.impl.entity.EntityDefinition
import org.moqui.impl.entity.EntityFacadeImpl
import org.moqui.entity.EntityFind
import org.moqui.impl.entity.EntityFindImpl
import org.moqui.entity.EntityValue
import org.moqui.impl.entity.EntityValueImpl

    org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("getPartyList.groovy")

    //def ddf = ec.entity.datasourceFactoryByGroupMap.get("transactional_nosql")
    //logger.info("TEST1 ddf: ${ddf}")
    ec.artifactExecution.disableAuthz()

    List <EntityValue> partyList = ec.entity.makeFind("Party").list()
    logger.info("partyList: ${partyList}")
    List <EntityValue> partyListJson = new ArrayList()


    partyList.each {party ->
        logger.info("getPartyList, party: ${party}")
        Map partyMap = ["partyId": party.partyId, "partyTypeEnumId": party.partyTypeEnumId]
        EntityValue person, org
        if (party.partyTypeEnumId == "PERSON") {
            person = ec.entity.makeFind("Person").condition(["partyId": party.partyId]).one()
            if (person) {
                partyMap["fullName"] = person.firstName + " " + person.lastName
                partyListJson.push(partyMap)
            } 
        } else {
            org = ec.entity.makeFind("Organization").condition(["partyId": party.partyId]).one()
            if (org) {
                partyMap["fullName"] = org.organizationName
                partyListJson.push(partyMap)
            }
        }
    }
    logger.info("partyListJson: ${partyListJson}")
    Map <String, Object> result = new HashMap()
    result.items = partyListJson
    return result
