import java.sql.Timestamp
import java.util.Date
import java.util.ArrayList

    org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("convert2Long.groovy")

                //logger.info("convert2Long(1), context.rows: ${context.rows}")
    def processRows(rows, logger) {
                //logger.info("convert2Long, rows: ${rows}")
        rows.each() {obj ->
                //logger.info("convert2Long, obj: ${obj}, class:, ${obj.getClass()}")
            if (obj instanceof Map) {
                obj.each() {k,v -> 
                    //logger.info("convert2Long, key: ${k}, value:  ${v}, class:, ${v.getClass()}")
                    if (v instanceof Timestamp) {
                        obj[k] = v.getTime()
                    } else if (v instanceof Date) {
                        obj[k] = v.toTimestamp().getTime()
                    } else if (v instanceof ArrayList) {
                        processRows(v, logger)
                    } 
                }
            }
        }
    }
    
                //logger.info("convert2Long(2), context.rows: ${context.rows}")
    processRows(context.rows, logger)
    
