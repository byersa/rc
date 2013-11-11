import spock.lang.*;

import org.moqui.context.ExecutionContext
import org.moqui.entity.EntityValue
import org.moqui.entity.EntityFind
import org.moqui.entity.EntityList
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

import au.com.bytecode.opencsv.CSVReader


class loadReseller extends Specification {

    protected final static org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(loadReseller.class)

    @Shared
    ExecutionContext ec

    @Shared
    Map vendors 
    
    @Shared
    List vendorList

    def setupSpec() {
        logger.info("In: loadReseller, setupSpec")
        ec = Moqui.getExecutionContext()
        logger.info("ec: ${ec}")
        logger.info("ec.entity: ${ec.entity}")
        ec.user.loginUser("rcadmin", "moqui", null)
        // vendors = [:]
        // CSVReader reader = new CSVReader(new FileReader("/home/byersa/dev/moqui-rc/runtime/component/rc/data/RCResellerData.csv"))            
        // logger.info("load reseller, CSVReader: ${CSVReader}")
        // String [] fields
        // def idx = 0
        // while ((fields = reader.readNext()) != null) {
        //     logger.info("load reseller, fields: ${fields}")
        //     if (idx++) {
        //         vendors[fields[2]] = 1
        //     }
        // }
        // reader.close()
        // List vendorList = vendors.keySet().toArray()
        // EntityValue party
        // String partyId
        // vendorList.each() {vendorName ->
        //     def findResults = ec.service.sync().name("mantle.party.PartyServices.findParty").parameters([organizationName:vendorName]).call() 
        //     logger.info("load reseller, findResults: ${findResults}")
        //     partyId = findResults.partyIdList[0]
        //     vendors[vendorName] = partyId            
        // }
        // logger.info("loadReseller, setup, vendors: ${vendors}")
    }

    def cleanupSpec() {
        logger.info("In: loadReseller, cleanupSpec")
        ec.destroy()
    }

    def setup() {
        logger.info("In: loadReseller, setup")
        ec.artifactExecution.disableAuthz()
    }

    def cleanup() {
        logger.info("In: loadReseller, cleanup")
        ec.artifactExecution.enableAuthz()
    }

    // def "load vendors"() {
    //     when:
    //         CSVReader reader = new CSVReader(new FileReader("/home/byersa/dev/moqui-rc/runtime/component/rc/data/RCResellerData.csv"))            
    //         logger.info("load reseller, CSVReader: ${CSVReader}")
    //         String [] fields
    //         def idx = 0
    //         while ((fields = reader.readNext()) != null) {
    //             logger.info("load reseller, fields: ${fields}")
    //             if (idx++) {
    //                 vendors[fields[2]] = 1
    //             }
    //         }
    //         reader.close()
            
    //         String partyId
    //         Map partyParams
    //         List vendorList = vendors.keySet().toArray()
    //         vendorList.each() {vendorName ->
    //             partyId = "RCP" + ec.entity.sequencedIdPrimary("Party", 0L, 0L)
    //             vendors[vendorName] = partyId
    //             partyParams = [parentPartyId: "RCHERBALS", partyId: partyId, partyTypeEnumId: "PtyOrganization", organizationName: vendorName]
    //             def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters(partyParams).call()
    //             logger.info("load reseller, createResultService: ${createResultService}")
    //           }
            
    //         // new File("/home/byersa/dev/moqui-rc/runtime/component/rc/data/RCProductData.csv").splitEachLine(",") {fields ->
    //         // String pPId = ec.entity.sequencedIdPrimary("ProductPrice", 0L, 0L)
    //         // logger.info("load Prices, pPId: ${pPId}")
    //         // ec.entity.makeValue("ProductPrice").setAll([productPriceId: pPId, productId: "RCP" + fields[0], priceTypeEnumId:"PptList", price:fields[3]]).createOrUpdate()
    //         // String pPId2 = ec.entity.sequencedIdPrimary("ProductPrice", 0L, 0L)
    //         // logger.info("load Prices, pPId2: ${pPId2}")
    //         // ec.entity.makeValue("ProductPrice").setAll([productPriceId: pPId2, productId: "RCP" + fields[0], priceTypeEnumId:"PptMinimum", price:fields[4]]).createOrUpdate()
    //     then:
    //         logger.info("END load Product")
    // }
    
    // def "load resellers"() {
    //     when:
    //     CSVReader reader = new CSVReader(new FileReader("/home/byersa/dev/moqui-rc/runtime/component/rc/data/RCResellerData.csv"))            
    //     logger.info("load reseller, CSVReader: ${CSVReader}")
    //     String [] fields
    //     String resellerId
    //     String vendorId
    //     def idx = 0
    //     while ((fields = reader.readNext()) != null) {
    //         if (idx++) {
    //             vendorId = vendors[fields[2]]
    //             logger.info("load reseller, fields: ${fields}, vendorId: ${vendorId}")
    //             Map parms = [
    //                  parentPartyId:vendorId, partyTypeEnumId:"PtyOrganization", 
    //                  partyId: "RCP" + ec.entity.sequencedIdPrimary("Party", 0L, 0L),
    //                  organizationName: fields[3]
    //                  ]
    //             if (fields[6] && fields[6] && fields[7] && fields[8]) {
    //                  parms["postalData"] = [[contactMechPurposeId: "PostalPrimary", address1: fields[4], city:fields[6], stateProvinceGeoId:"USA_"+fields[7], postalCode:fields[8]]]
    //             }
    //             if (fields[9]) {
    //                  String phoneNumber = fields[9].substring(1,4) + "-" + fields[9].substring(6)
    //                  parms["phoneData"] = [[contactMechPurposeId: "PhonePrimary", contactNumber: phoneNumber]]
    //             }
    //             logger.info("load reseller, parms: ${parms}")
    //             def createResultService = ec.service.sync().name("rcherbals.PartyServices.storeParty").parameters(parms).call()
    //         }
                 
    //     }
            
    //     then:
    //         true
    // }
    
    def "add RCHERBALS connections"() {
        when:
            EntityFind ef = ec.entity.makeFind("PartyRelationship")
            ef.condition("toPartyId", "RCHERBALS")
            EntityList el = ef.list()     
            //logger.info("loadReseller, add RCHERBALS connections, el: ${el}")
            def count = 0
            el.each() {pr ->
                EntityFind ef2 = ec.entity.makeFind("PartyRelationship")
                ef2.condition("toPartyId", pr.fromPartyId)
                EntityList el2 = ef2.list()     
                logger.info("loadReseller, add RCHERBALS connections, toPartyId: ${pr.fromPartyId}, el2: ${el2}")
                el2.each() {pr2 ->
                    EntityValue ev = ec.entity.makeValue("PartyRelationship")
                    ev.setAll([toPartyId: "RCHERBALS",
                                "toRoleTypeId": "Owner",
                                "fromPartyId": pr2.fromPartyId,
                                "fromRoleTypeId": "Reseller",
                                "fromDate": ec.user.nowTimestamp,
                                "relationshipTypeEnumId":"PrtCustomer",
                                "partyRelationshipId": ec.entity.sequencedIdPrimary("mantle.party.PartyRelationship", 0L, 0L)
                                ])
                    logger.info("loadReseller, add RCHERBALS connections, ev: ${ev}")
                    ev.create()
                    
                }
            }
        then:
            el.size()
    }
}