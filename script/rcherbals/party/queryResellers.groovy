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
import java.net.URLEncoder

import org.elasticsearch.node.NodeBuilder
import org.elasticsearch.client.Client
import org.elasticsearch.client.AdminClient
import org.elasticsearch.common.settings.ImmutableSettings
import org.elasticsearch.common.settings.Settings
import org.elasticsearch.action.admin.indices.create.CreateIndexRequestBuilder
import org.elasticsearch.action.admin.indices.create.CreateIndexRequest
import org.elasticsearch.action.admin.indices.create.CreateIndexResponse
import org.elasticsearch.action.admin.indices.delete.DeleteIndexRequest
import org.elasticsearch.action.admin.indices.delete.DeleteIndexResponse
import org.elasticsearch.action.index.IndexResponse
import org.elasticsearch.search.SearchHits
import org.elasticsearch.index.query.QueryStringQueryBuilder
import org.elasticsearch.search.query.QuerySearchRequest
import org.elasticsearch.search.query.QuerySearchResult
import org.elasticsearch.action.search.SearchRequestBuilder
import org.elasticsearch.index.query.FilterBuilders
import org.elasticsearch.index.query.GeoDistanceRangeFilterBuilder
import org.elasticsearch.index.query.GeoDistanceFilterBuilder
import org.elasticsearch.action.search.SearchResponse
import org.elasticsearch.common.unit.DistanceUnit
import org.elasticsearch.index.query.QueryBuilders
import org.elasticsearch.action.admin.indices.refresh.RefreshRequest
import org.elasticsearch.action.admin.indices.refresh.RefreshResponse

import groovy.json.JsonSlurper

    org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("queryResellers.groovy")

    //def ddf = ec.entity.datasourceFactoryByGroupMap.get("transactional_nosql")
    //logger.info("TEST1 ddf: ${ddf}")
    ec.artifactExecution.disableAuthz()

    
    logger.info("context(2): ${context}")

        String address = "";
        Double lat, lng;
    logger.info("context.postalCode: ${context.postalCode}")
        if(context.postalCode) {
            address = context.postalCode + ", United States"
            def url = new URL('http://ziptasticapi.com/' + context.postalCode)
            logger.info("geocodeResellers, url(0): ${url}")
            def geoCodeResult = url.getText()
            logger.info("geocodeResellers, geoCodeResult(0): ${geoCodeResult}")
            def slurper = new JsonSlurper()
            def data = slurper.parseText(geoCodeResult)
            logger.info("geocodeResellers, data(0): ${data}")
            context.city = data.city
            context.state = data.state
            logger.info("context(postal): ${context}")
        }
        if(context.city && context.state) {
            address = context.city + "," + context.state
            encodedAddress = URLEncoder.encode(address)
            logger.info("geocodeResellers, address: ${address}, encoded: ${encodedAddress}")
    
            def url = new URL('http://maps.googleapis.com/maps/api/geocode/xml?address=' + encodedAddress + '&sensor=true')
            def geoCodeResult = new XmlParser().parseText(url.getText())
            logger.info("geocodeResellers, geoCodeResult: ${geoCodeResult}")
            logger.info("geocodeResellers, geoCodeResult.result[0].geometry.location: ${geoCodeResult.result[0].geometry[0].location[0]}")
            lat = geoCodeResult.result[0].geometry[0].location[0].lat.text().toDouble()
            lng = geoCodeResult.result[0].geometry[0].location[0].lng.text().toDouble()
        }

//def lat = 26.51928
//def lng = -81.94045
        SearchRequestBuilder srb = ec.elasticSearchClient.prepareSearch().setIndices("rcherbals").setTypes("object")
        logger.info("query documents, srb: ${srb}")
		srb.setQuery(QueryBuilders.matchAllQuery())
        srb.setFrom(0).setSize(100)
        logger.info("query documents, srb 2: ${srb}")
		GeoDistanceFilterBuilder fb = FilterBuilders.geoDistanceFilter("location")
        logger.info("query documents, fb: ${fb}")
		fb.lat(lat).lon(lng).distance(context.distance, DistanceUnit.KILOMETERS)
		srb.setFilter(fb)
        logger.info("query documents, fb 2: ${fb}")
		SearchResponse response = srb.execute().actionGet()
        logger.info("query documents, response: ${response}")
        SearchHits hits = response.getHits()
        logger.info("query documents, hits: ${hits}")

        EntityValue party, hitId
        EntityFind ef = ec.entity.makeFind("Party")
        List partyListJson = []
        def longitude, latitude, location, src
        hits.each() {hit->
            logger.info("queryReseller, hit: ${hit.getId()}")
            src = hit.getSource()
            location = src.location
            longitude = location.lon
            latitude = location.lat
            party = ec.entity.makeFind("Party").condition("partyId", hit.getId()).one()
            Map partyMap = ["partyId": party.partyId, "partyTypeEnumId": party.partyTypeEnumId,
                        latitude: latitude, longitude: longitude]
            EntityValue person, org
            if (party.partyTypeEnumId == "PtyOrganization") {
                org = ec.entity.makeFind("Organization").condition(["partyId": party.partyId]).one()
                partyMap["organizationName"] = org.organizationName
    
            }
            List <EntityValue> partyMapList = ec.entity.makeFind("PartyContactMech").condition("partyId", party.partyId).list()
            partyMapList.each() {partyContactMech ->
                switch(partyContactMech.contactMechPurposeId){
                    case ["PhonePrimary","PhoneShippingOrigin","PhoneShippingDest"]:
                        List <EntityValue> phoneList = ec.entity.makeFind("TelecomNumber").condition("contactMechId", partyContactMech.contactMechId).list()
                        if (phoneList.size()) {
                            List phoneData = []
                            phoneList.each() {telecomNumber ->
                                 phoneData.push([contactMechId: telecomNumber.contactMechId, contactMechPurposeId:partyContactMech.contactMechPurposeId, \
                                                 contactNumber: telecomNumber.contactNumber, fromDate: partyContactMech.fromDate, thruDate:partyContactMech.thruDate]) 
                            }
                            partyMap["phoneData"] = phoneData
                        }
                        break;
                    case ["PostalPrimary","PostalGeneral"]:
                        List <EntityValue> postalList = ec.entity.makeFind("PostalAddress").condition("contactMechId", partyContactMech.contactMechId).list()
                        if (postalList.size()) {
                            List postalData = []
                            postalList.each() {postalAddress ->
                                 postalData.push([contactMechId: partyContactMech.contactMechId, contactMechPurposeId:partyContactMech.contactMechPurposeId, \
                                                fromDate: partyContactMech.fromDate, thruDate:partyContactMech.thruDate, \
                                                 address1: postalAddress.address1, address2: postalAddress.address2, \
                                                 city: postalAddress.city, stateProvinceGeoId: postalAddress.stateProvinceGeoId, postalCode: postalAddress.postalCode \
                                                 ]) 
                            }
                            partyMap["postalData"] = postalData
                        }
                        break;
                    case ["EmailPrimary","EmailOther"]:
                        List <EntityValue> emailList = ec.entity.makeFind("ContactMech").condition("contactMechId", partyContactMech.contactMechId).list()
                        if (emailList.size()) {
                            List emailData = []
                            emailList.each() {emailAddress ->
                                 emailData.push([contactMechId: partyContactMech.contactMechId, contactMechPurposeId:partyContactMech.contactMechPurposeId, \
                                                fromDate: partyContactMech.fromDate, thruDate:partyContactMech.thruDate, \
                                                 infoString: emailAddress.infoString \
                                                 ]) 
                            }
                            partyMap["emailData"] = emailData
                        }
                        break;
                    default:
                        break;
                }
            }
            partyListJson.push(partyMap)
        }
            logger.info("In: queryParty, partyListJson: ${partyListJson}")
        //Map <String, Object> result = new HashMap()
        result.items = partyListJson
    