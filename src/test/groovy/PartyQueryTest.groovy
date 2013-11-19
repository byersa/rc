import spock.lang.*;

import org.moqui.context.ExecutionContext
import org.moqui.entity.EntityValue
import org.moqui.entity.EntityFind
import org.moqui.entity.EntityList
import org.moqui.entity.EntityDynamicView
import org.moqui.impl.entity.EntityDefinition
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

class PartyQueryTest extends Specification {

    protected final static org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PartyQueryTest.class)

    @Shared
    ExecutionContext ec

    def setupSpec() {
        logger.info("In: PartyQueryTest, setupSpec")
        ec = Moqui.getExecutionContext()
        logger.info("ec: ${ec}")
        logger.info("ec.entity: ${ec.entity}")
        ec.user.loginUser("rcadmin", "moqui", null)
    }

    def cleanupSpec() {
        logger.info("In: PartyQueryTest, cleanupSpec")
        ec.destroy()
    }

    def setup() {
        logger.info("In: PartyQueryTest, setup")
        ec.artifactExecution.disableAuthz()
    }

    def cleanup() {
        logger.info("In: PartyQueryTest, cleanup")
        ec.artifactExecution.enableAuthz()
    }

    // def "test RCFindPartyView"() {
    //     when:
    //         //EntityDefinition entityDef = ec.entity.getEntityDefinition("rcherbals.RCFindPartyView")
    //         //logger.info("PartyQueryTest, RCFindPartyView, entityDef: ${entityDef}")
            
    //         EntityFind ef = ec.entity.makeFind("rcherbals.RCFindPartyView")
    //         logger.info("PartyQueryTest, RCFindPartyView, ef 1: ${ef}")
    //         ef.condition(["partyId": "RCP100695", "toPartyId": "RCHERBALS"])
    //         logger.info("PartyQueryTest, RCFindPartyView, ef 2: ${ef}")
    //         List findPartyView = ef.list()
    //         logger.info("PartyQueryTest, RCFindPartyView, findPartyView: ${findPartyView}")
    //     then:
    //         true
    // }
    def "basic query"() {
        expect:
            logger.info("PartyQueryTest, START")
            def queryResultService = ec.service.sync().name("rcherbals.PartyServices.queryParty").parameters([
                 toPartyId:_toPartyId, 
                 limit:_limit, offset:_offset, pageSize: _pageSize
            ]).call()
                 
            logger.info("PartyQueryTest (basic), queryResultService: ${queryResultService}")
            List items = queryResultService.items
            logger.info("items: ${items}")
            Map item = items[0]
            logger.info("item: ${item}")
                 
        where:
        _toPartyId | _fromPartyIdList | _isOrganizationType | _isPersonType | _organizationName | _contactNumber | _limit | _offset | _pageSize
        "RCHERBALS" | null     | false | false | "Green Earth" | "607-432-7160" | 5 | 0 | 20
    }
    
    def "org query"() {
        expect:
            logger.info("PartyQueryTest, START")
            def queryResultService = ec.service.sync().name("rcherbals.PartyServices.queryParty").parameters([
                 toPartyId:_toPartyId, 
                 organizationName: _organizationName,
                 isOrganizationType:_isOrganizationType, isPersonType:_isPersonType,
                 limit:_limit, offset:_offset, pageSize: _pageSize
            ]).call()
                 
            logger.info("PartyQueryTest (org), queryResultService: ${queryResultService}")
            List items = queryResultService.items
            //logger.info("items: ${items}")
            Map item = items[0]
            logger.info("item: ${item}")
                 
        where:
        _toPartyId | _fromPartyIdList | _isOrganizationType | _isPersonType | _organizationName | _contactNumber | _limit | _offset | _pageSize
        "RCHERBALS" | null     | true | false | "Green Earth" | "607-432-7160" | 5 | 0 | 20
    }
    
    def "phone query"() {
        expect:
            logger.info("PartyQueryTest, START")
            def queryResultService = ec.service.sync().name("rcherbals.PartyServices.queryParty").parameters([
                 toPartyId:_toPartyId, 
                 contactNumber: _contactNumber,
                 isOrganizationType:_isOrganizationType, isPersonType:_isPersonType,
                 limit:_limit, offset:_offset, pageSize: _pageSize
            ]).call()
                 
            logger.info("PartyQueryTest(phone), queryResultService: ${queryResultService}")
            List items = queryResultService.items
            //logger.info("items: ${items}")
            Map item = items[0]
            logger.info("item: ${item}")
                 
        where:
        _toPartyId | _fromPartyIdList | _isOrganizationType | _isPersonType | _organizationName | _contactNumber | _limit | _offset | _pageSize
        "RCHERBALS" | null     | false | false | "Green Earth" | "607-432-7160" | 5 | 0 | 20
    }
    
    def "postal query"() {
        expect:
            logger.info("PartyQueryTest, START")
            def queryResultService = ec.service.sync().name("rcherbals.PartyServices.queryParty").parameters([
                 toPartyId:_toPartyId, 
                 city: _city,
                 isOrganizationType:_isOrganizationType, isPersonType:_isPersonType,
                 limit:_limit, offset:_offset, pageSize: _pageSize
            ]).call()
                 
            logger.info("PartyQueryTest(postal), queryResultService: ${queryResultService}")
            List items = queryResultService.items
            //logger.info("items: ${items}")
            Map item = items[0]
            logger.info("item: ${item}")
                 
        where:
        _toPartyId | _fromPartyIdList | _isOrganizationType | _isPersonType | _organizationName | _contactNumber | _city | _limit | _offset | _pageSize
        "RCHERBALS" | null     | true | false | "Green Earth" | "607-432-7160" | "One%" | 5 | 0 | 20
    }
    def "phone and postal query"() {
        expect:
            logger.info("PartyQueryTest, START")
            def queryResultService = ec.service.sync().name("rcherbals.PartyServices.queryParty").parameters([
                 toPartyId:_toPartyId, 
                 contactNumber: _contactNumber,
                 city: _city,
                 isOrganizationType:_isOrganizationType, isPersonType:_isPersonType,
                 limit:_limit, offset:_offset, pageSize: _pageSize
            ]).call()
                 
            logger.info("PartyQueryTest(phone and postal), queryResultService: ${queryResultService}")
            List items = queryResultService.items
            //logger.info("items: ${items}")
            Map item = items[0]
            logger.info("item: ${item}")
                 
        where:
        _toPartyId | _fromPartyIdList | _isOrganizationType | _isPersonType | _organizationName | _contactNumber | _city | _limit | _offset | _pageSize
        "RCHERBALS" | null     | true | false | "Green Earth" | "607-432-7160" | "Oneonta" | 5 | 0 | 20
    }
}