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

    org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("queryProduct.groovy")

    ec.artifactExecution.disableAuthz()

    
    logger.info("context: ${context}")
    EntityFind ef
    EntityDynamicView edv
    
    List<EntityConditionImplBase> condList = []
    EntityConditionFactory ecf = ec.entity.getConditionFactory()
    logger.info("queryProduct, context: ${context}");
    
        ef = ec.entity.makeFind("Product")
        edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PROD", "Product", null, null, null)
        edv.addAliasAll("PROD", null)
    if (context.partyId) {
        edv.addMemberEntity("PRODPTY", "ProductParty", "PROD", false, ['productId':'productId'])
        edv.addAliasAll("PRODPTY", null)
        EntityConditionImplBase cond = ecf.makeCondition("partyId", EntityCondition.EQUALS, context.partyId)
        condList.push(cond)
    }
    if (context.productTypeEnumId == "PtyOrganization") {
            edv.addMemberEntity("ORG", "Organization", this.masterJoinAlias, false, ['productId':'productId'])
            edv.addAliasAll("ORG", null)
            isOrganizationType = true
    }
    if (context.productName) {
        EntityConditionImplBase cond = ecf.makeCondition("productName", EntityCondition.EQUALS, context.productName)
        condList.push(cond)
    }
        EntityList productViewEntityList, filteredList
        if(condList.size) {
            EntityConditionImplBase entityListCond = ecf.makeCondition(condList)
            logger.info("In: queryProduct, entityListCond: ${entityListCond}")
            ef.condition(entityListCond) //.selectField("productId").selectField( "productName")
            productViewEntityList = ef.list()
        } else {
            def f2sel = ef.getSelectFields()
            logger.info("In: queryProduct, f2sel: ${f2sel}")
            //ef.selectField("productId").selectField( "productName")
            def f2sel2 = ef.getSelectFields()
            logger.info("In: queryProduct, f2sel2: ${f2sel2}")
            productViewEntityList = ef.list()
        }        
        logger.info("In: queryProduct, productViewEntityList(${productViewEntityList.size()}: ${productViewEntityList}")
    if(context.partyId) {
        filteredList = productViewEntityList.filterByDate("fromDate", "thruDate", null)
    } else {
        filteredList = productViewEntityList; 
    }
        logger.info("In: queryProduct, filteredList(${filteredList.size()}: ${filteredList}")
    def returnList = []
    filteredList.each() {product ->
        logger.info("In: queryProduct, product: ${product}")
        if(context.partyId) {
            returnList.push([productId: product.productId, productName: product.productName, roleTypeId: product.roleTypeId, fromDate: product.fromDate, thruDate: product.thruDate])
        } else {
            returnList.push([productId: product.productId, productName: product.productName])
        }
    }
    result.items = returnList
    return result
