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

    org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("indexResellers.groovy")

    //def ddf = ec.entity.datasourceFactoryByGroupMap.get("transactional_nosql")
    //logger.info("TEST1 ddf: ${ddf}")
    ec.artifactExecution.disableAuthz()

    
    EntityFind ef
    Map <String, String> joinKeys = ['partyId':'partyId']
    String masterJoinAlias
    EntityDynamicView edv
    
    logger.info("indexResellers, context: ${context}")
    logger.info("indexResellers, transaction status: ${ec.getTransaction().getStatusString()}")

    List<EntityConditionImplBase> condList = []
    EntityConditionFactory ecf = ec.entity.getConditionFactory()
    
        ef = ec.entity.makeFind("Party")
        edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PTY", "Party", null, null, null)
        edv.addAliasAll("PTY", null)
        edv.addMemberEntity("PGP", "PartyGeoPoint", "PTY", null, ['partyId':'partyId'])
        edv.addAliasAll("PGP", null)
        edv.addMemberEntity("GEO", "GeoPoint", "PGP", false, ['geoPointId':'geoPointId'])
        edv.addAliasAll("GEO", null)
        
        // delete index
        DeleteIndexResponse deleteIndexResponse = ec.elasticSearchClient.admin().indices().delete(new DeleteIndexRequest('rcherbals')).actionGet()
        logger.info("delete index, :" +  deleteIndexResponse.isAcknowledged())
        
        //create index
            Settings settings = ImmutableSettings.settingsBuilder().put("cluster.name", "ElasticSearchClient").build()
            logger.info("create index, settings: ${settings}")
            CreateIndexRequestBuilder createIndexRequestBuilder = ec.elasticSearchClient.admin().indices().prepareCreate("rcherbals")
            logger.info("create index, createIndexRequestBuilder: ${createIndexRequestBuilder}")
            String geoMapStr = """{ 
                         "properties": { 
                              "location": { "type": "geo_point", "lat_lon": "true"} 
                               } 
                         }"""

            Map geoMap = new HashMap()
            Map propMap = new HashMap()
            Map locationMap = new HashMap()
            locationMap.put("type", "geo_point")
            locationMap.put("lat_lon", "true")
            propMap.put("location", locationMap);
            geoMap.put("properties", propMap);
        
            logger.info("create index, geoMap: ${geoMap}")
            createIndexRequestBuilder.addMapping("object", geoMap)
            CreateIndexResponse response1 = createIndexRequestBuilder.execute().actionGet()
            logger.info("get elasticsearch, :" +  response1.isAcknowledged())
        
        EntityList partyViewEntityList = ef.list()
        logger.info("indexResellers, partyViewEntityList: ${partyViewEntityList.size()}")
        String address = "", state, encodedAddress;
        partyViewEntityList.each {party ->
        
        logger.info("indexResellers, party: ${party}")
	        Map doc1 = new HashMap()
            Map fieldMap = new HashMap()
            fieldMap.put("lat", party.latitude)
            fieldMap.put("lon", party.longitude)
            doc1.put("location", fieldMap)
            logger.info("load documents, doc1: ${doc1}")
            IndexResponse response2 = ec.elasticSearchClient
                        .prepareIndex("rcherbals", "object", party.partyId)
                        .setSource(doc1).execute().actionGet()
            logger.info("load documents 1, response2.index: ${response2.getIndex()}, response2.type: ${response2.getType()}, id: ${response2.getId()}, version: ${response2.getVersion()}")
        }
