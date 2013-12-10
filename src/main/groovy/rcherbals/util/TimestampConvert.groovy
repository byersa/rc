package rcherbals.util.TimestampConvert

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.sql.Timestamp
import java.util.Date

class TimestampConvert {
    protected final static Logger logger = LoggerFactory.getLogger(TimestampConvert.class)

    public static void convert2Long (List rows) {
        rows.each() {obj ->
            obj.each() {k,v -> 
                logger.info("value, class: ${v}, ${v.getClass()}")
                if (v instanceof Timestamp) {
                    obj[k] = v.getTime()
                } else if (v instanceof Date) {
                    obj[k] = v.toTimestamp().getTime()
                }
            }
        }
    }
}