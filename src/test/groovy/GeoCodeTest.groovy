import spock.lang.*;

import org.moqui.context.ExecutionContext
import org.moqui.Moqui

class GeoCodeTest extends Specification {

    protected final static org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(GeoCodeTest.class)

    @Shared
    ExecutionContext ec

    def setupSpec() {
        logger.info("In: GeoCodeTest, setupSpec")
    }

    def cleanupSpec() {
        logger.info("In: GeoCodeTest, cleanupSpec")
    }

    def setup() {
        logger.info("In: GeoCodeTest, setup")
    }

    def cleanup() {
        logger.info("In: GeoCodeTest, cleanup")
    }


    def "geoCode809"() {
        when:        
        logger.info("In: GeoCodeTest, geoCodeOne")
        def url = new URL('http://maps.googleapis.com/maps/api/geocode/xml?address=809+Ellison+Lane,+Waynesboro,+VA+22980&sensor=true')
        def geoCodeResult = new XmlParser().parseText(url.getText())
        def lat = geoCodeResult.result.geometry.location.lat.text()
        def lng = geoCodeResult.result.geometry.location.lng.text()
        
        then:
        logger.info("In: GeoCodeTest, geoCode809, lat/lon: ${lat}/${lng}")

    }

    def "geoCodeWaynesboro"() {
        when:        
        logger.info("In: GeoCodeTest, geoCodeWaynesboro")
        def url = new URL('http://maps.googleapis.com/maps/api/geocode/xml?address=Waynesboro,+VA&sensor=true')
        def geoCodeResult = new XmlParser().parseText(url.getText())
        def lat = geoCodeResult.result.geometry.location.lat.text()
        def lng = geoCodeResult.result.geometry.location.lng.text()
        
        then:
        logger.info("In: GeoCodeTest, geoCodeWaynesboro, lat/lon: ${lat}/${lng}")

    }

    def "geoCodeZip"() {
        when:        
        logger.info("In: GeoCodeTest, geoCodeZip")
        def url = new URL('http://maps.googleapis.com/maps/api/geocode/xml?address=22980&sensor=true')
        def geoCodeResult = new XmlParser().parseText(url.getText())
        def lat = geoCodeResult.result.geometry.location.lat.text()
        def lng = geoCodeResult.result.geometry.location.lng.text()
        
        then:
        logger.info("In: GeoCodeTest, geoCodeZip, lat/lon: ${lat}/${lng}")

    }

}
