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

    org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("assocProductWParty.groovy")

    ec.artifactExecution.disableAuthz()
    
    logger.info("assocProductWParty, context: ${context}")

    List productPartyList, returnItems = [], productIds = []
    context.items.each() {party ->
        EntityFind ef = ec.entity.makeFind("ProductParty").condition("partyId", EntityCondition.EQUALS, party.partyId)
        productPartyList = ef.list()
        productIds = []
        productPartyList.each() {productParty ->
            productIds.push(productParty.productId)
        }
        party.productData = productIds
        ef = ec.entity.makeFind("ProductParty")
        returnItems.push(party)
    }
    result.items = returnItems
    logger.info("assocProductWParty, result: ${result}")
