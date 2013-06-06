
import spock.lang.*;

import org.moqui.context.ExecutionContext
import org.moqui.entity.EntityValue
import org.moqui.Moqui
import org.moqui.context.ResourceReference


class POITest extends Specification {

    protected final static org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(POITest.class)

    @Shared
    ExecutionContext ec

    def setupSpec() {
        logger.info("In: POITest, setupSpec")
        ec = Moqui.getExecutionContext()
        logger.info("ec: ${ec}")
        logger.info("ec.entity: ${ec.entity}")
    }

    def cleanupSpec() {
        logger.info("In: POITest, cleanupSpec")
        ec.destroy()
    }

    def setup() {
        logger.info("In: POITest, setup")
        ec.artifactExecution.disableAuthz()
    }

    def cleanup() {
        logger.info("In: POITest, cleanup")
        ec.artifactExecution.enableAuthz()
    }

    def "loadMAPViolations"() {
        when:        
        logger.info("In: POITest, loadMAPViolations")
        def createResultService = ec.service.sync().name("rcherbals.MAPServices.loadMAPViolations").call()
        
        then:
        logger.info("In: CCoachEntityTests, createResultService: ${createResultService}")

    }
}



