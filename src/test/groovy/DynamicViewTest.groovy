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


class DynamicViewTest extends Specification {

    protected final static org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(DynamicViewTest.class)

    @Shared
    ExecutionContext ec

    def setupSpec() {
        logger.info("In: DynamicViewTest, setupSpec")
        ec = Moqui.getExecutionContext()
        logger.info("ec: ${ec}")
        logger.info("ec.entity: ${ec.entity}")
    }

    def cleanupSpec() {
        logger.info("In: DynamicViewTest, cleanupSpec")
        ec.destroy()
    }

    def setup() {
        logger.info("In: DynamicViewTest, setup")
        ec.artifactExecution.disableAuthz()
    }

    def cleanup() {
        logger.info("In: DynamicViewTest, cleanup")
        ec.artifactExecution.enableAuthz()
    }

    def "query on Party and Organization"() {
        when:        
        logger.info("In: DynamicViewTest, query on Party and Organization 2")
        /*
        EntityFind ef = ec.entity.makeFind("PartyOrgView")
        def lst = ef.list()
        logger.info("In: DynamicViewTest, query on Party and Organization, lst: ${lst}")
        */
        /*
        EntityFind ef = ec.entity.makeFind("Party")
        EntityDynamicView edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PRTY", "Party", null, null, null)
        edv.addMemberEntity("ORG", "Organization", "PRTY", null, ['partyId':'partyId'])
        edv.addAliasAll("PRTY", null)
        edv.addAliasAll("ORG", null)
        def lst = ef.condition("organizationName", "ABC Health").list()
        logger.info("In: DynamicViewTest, query on Party and Organization, partyOrg: ${lst}")
        */
    String partyTypeEnumId = 'ORGANIZATION'
   // String firstName = context.firstName
   // String lastName = context.lastName
    String organizationName = 'ABC Health'
    //String emailAddress = context.emailAddress
    //String phoneNumber = context.phoneNumber
    //String city = context.city
    //String state = context.state
    
    logger.info("partyTypeEnumId: ${partyTypeEnumId}")
    //logger.info("lastName: ${lastName}")
    logger.info("organizationName: ${organizationName}")
   // logger.info("emailAddress: ${emailAddress}")
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
        
        then:
        logger.info("In: DynamicViewTest, : ${}")

    }
}


