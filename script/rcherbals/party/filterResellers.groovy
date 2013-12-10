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

    org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("filterResellers.groovy")

    ec.artifactExecution.disableAuthz()
    
    logger.info("filterResellers, context: ${context}")
    
    EntityConditionFactory ecf = ec.entity.getConditionFactory()
    EntityFind ef
    EntityConditionImplBase cond, condFilter, entityListCond
    if (context.productIdList && context.productIdList.size()) {
        condFilter = ecf.makeCondition("productId", EntityCondition.IN, context.productIdList)

        List productPartyList, returnItems = []
        context.items.each() {party ->
            ef = ec.entity.makeFind("ProductParty")
            cond = ecf.makeCondition("partyId", EntityCondition.EQUALS, party.partyId)
            logger.info("filterResellers, cond: ${cond}")
            if (context.productIdList && context.productIdList.size()) {
                List<EntityConditionImplBase> condList = []
                condList.push(cond)
                condList.push(condFilter)
                entityListCond = ecf.makeCondition(condList)
                logger.info("filterResellers, entityListCond: ${entityListCond}")
                ef.condition(entityListCond)
            } else {
                ef.condition(cond)
            }
            productPartyList = ef.list()
            logger.info("filterResellers, productPartyList: ${productPartyList}")
            List filteredList = productPartyList.filterByDate(null, null, null)
            logger.info("filterResellers, filteredList: ${filteredList}")
            if (filteredList.size()) {
                returnItems.push(party)
            }
        }
        result.items = returnItems
    } else {
        result.items = context.items
    }
