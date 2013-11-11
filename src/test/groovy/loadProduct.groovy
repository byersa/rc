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


class loadProduct extends Specification {

    protected final static org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(loadProduct.class)

    @Shared
    ExecutionContext ec

    def setupSpec() {
        logger.info("In: loadProduct, setupSpec")
        ec = Moqui.getExecutionContext()
        logger.info("ec: ${ec}")
        logger.info("ec.entity: ${ec.entity}")
        ec.user.loginUser("rcadmin", "moqui", null)
    }

    def cleanupSpec() {
        logger.info("In: loadProduct, cleanupSpec")
        ec.destroy()
    }

    def setup() {
        logger.info("In: loadProduct, setup")
        ec.artifactExecution.disableAuthz()
    }

    def cleanup() {
        logger.info("In: loadProduct, cleanup")
        ec.artifactExecution.enableAuthz()
    }

    // def "load Product"() {
    //     when:
    //         new File("/home/byersa/dev/moqui-rc/runtime/component/rc/data/RCProductData.csv").splitEachLine(",") {fields ->
    //         ec.entity.makeValue("Product").setAll([productId: "RCP" + fields[0], productName:fields[5]]).createOrUpdate()
    //         }   
    //     then:
    //         logger.info("END load Product")
    // }
    
    def "load Prices"() {
        when:
            new File("/home/byersa/dev/moqui-rc/runtime/component/rc/data/RCProductData.csv").splitEachLine(",") {fields ->
            String pPId = ec.entity.sequencedIdPrimary("ProductPrice", 0L, 0L)
            logger.info("load Prices, pPId: ${pPId}")
            ec.entity.makeValue("ProductPrice").setAll([productPriceId: pPId, productId: "RCP" + fields[0], priceTypeEnumId:"PptList", price:fields[3]]).createOrUpdate()
            String pPId2 = ec.entity.sequencedIdPrimary("ProductPrice", 0L, 0L)
            logger.info("load Prices, pPId2: ${pPId2}")
            ec.entity.makeValue("ProductPrice").setAll([productPriceId: pPId2, productId: "RCP" + fields[0], priceTypeEnumId:"PptMinimum", price:fields[4]]).createOrUpdate()
            }   
        then:
            logger.info("END load Product")
    }
    

}