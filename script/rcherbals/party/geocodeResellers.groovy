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


    org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("geocodeResellers.groovy")

    ec.artifactExecution.disableAuthz()

    EntityFind ef
    Map <String, String> joinKeys = ['partyId':'partyId']
    String masterJoinAlias
    EntityDynamicView edv
    
    logger.info("geocodeResellers, context: ${context}")
    logger.info("geocodeResellers, transaction status: ${ec.getTransaction().getStatusString()}")

    List<EntityConditionImplBase> condList = []
    EntityConditionFactory ecf = ec.entity.getConditionFactory()
    
        ef = ec.entity.makeFind("Party")
        edv = ef.makeEntityDynamicView()
        edv.addMemberEntity("PTY", "Party", null, null, null)
        edv.addAliasAll("PTY", null)
        edv.addMemberEntity("PTYRLE", "PartyRole", "PTY", false, ['partyId':'partyId'])
        edv.addAliasAll("PTYRLE", null)
        
        efP = ec.entity.makeFind("PartyContactMech")
        edvP = efP.makeEntityDynamicView()
        edvP.addMemberEntity("PCM", "PartyContactMech", null, null, null)
        edvP.addAliasAll("PCM", null)
        edvP.addMemberEntity("POSTAL", "PostalAddress", "PCM", false, ['contactMechId':'contactMechId'])
        edvP.addAliasAll("POSTAL", null)
        
        efG = ec.entity.makeFind("PartyGeoPoint")
        edvG = efG.makeEntityDynamicView()
        edvG.addMemberEntity("PGP", "PartyGeoPoint", null, null, null)
        edvG.addAliasAll("PGP", null)
        edvG.addMemberEntity("GEO", "GeoPoint", "PGP", false, ['geoPointId':'geoPointId'])
        edvG.addAliasAll("GEO", null)
        
        EntityConditionImplBase cond = ecf.makeCondition("roleTypeId", EntityCondition.EQUALS, "Reseller")
        ef.condition(cond) 
        ef.offset(context.offset)
        ef.limit(context.limit)
        EntityList partyViewEntityList = ef.list()
        logger.info("geocodeResellers, partyViewEntityList: ${partyViewEntityList}")
        String address = "", state, encodedAddress;
        partyViewEntityList.each {party ->
            logger.info("geocodeResellers, party: ${party}")
            List <EntityValue> postalList = efP.condition("partyId", party.partyId).list()
            if (postalList.size()) {
                EntityValue postal = postalList[0]
                logger.info("geocodeResellers, postal: ${postal}")
                address = postal.address1 + ", "
                state = postal.stateProvinceGeoId.substring(4)
                address += postal.city + ", " + state + " " + postal.postalCode
                encodedAddress = URLEncoder.encode(address)
                logger.info("geocodeResellers, address: ${address}, encoded: ${encodedAddress}")

                def url = new URL('http://maps.googleapis.com/maps/api/geocode/xml?address=' + encodedAddress + '&sensor=true')
                def geoCodeResult = new XmlParser().parseText(url.getText())
                logger.info("geocodeResellers, geoCodeResult: ${geoCodeResult}")
                //logger.info("geocodeResellers, geoCodeResult.result.geometry: ${geoCodeResult.result.geometry}")
                //logger.info("geocodeResellers, geoCodeResult.result.geometry.location: ${geoCodeResult.result.geometry.location}")
                logger.info("geocodeResellers, geoCodeResult.result[0].geometry.location: ${geoCodeResult.result[0].geometry[0].location[0]}")
                def lat = geoCodeResult.result[0].geometry[0].location[0].lat.text()
                def lng = geoCodeResult.result[0].geometry[0].location[0].lng.text()
                logger.info("geocodeResellers, lat: ${lat}, lng: ${lng}")
                List <EntityValue> geoList = efG.condition("partyId", party.partyId).list()
                if (geoList.size()) {
                    geoList[0].remove()
                }
                EntityValue geo = ec.entity.makeValue("GeoPoint")
                geo.latitude = lat
                geo.longitude = lng
                geo.geoPointId = ec.entity.sequencedIdPrimary("GeoPoint", null, null)
                logger.info("geocodeResellers, geo: ${geo}")
                geo.create()
                
                partyGeo = ec.entity.makeValue("PartyGeoPoint")
                partyGeo.partyId = party.partyId
                partyGeo.geoPointId = geo.geoPointId
                partyGeo.fromDate = ec.user.nowTimestamp
                logger.info("geocodeResellers, partyGeo: ${partyGeo}")
                partyGeo.create()
                
            }
            Object.sleep(100)
        }
