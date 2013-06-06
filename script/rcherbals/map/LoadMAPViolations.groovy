import org.moqui.context.ExecutionContext
import org.moqui.impl.entity.EntityDefinition
import org.moqui.entity.EntityValue
import org.moqui.Moqui
import org.moqui.context.ResourceReference
import groovy.json.JsonSlurper
import groovy.json.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.sql.Timestamp

import org.apache.poi.hssf.usermodel.HSSFSheet
import org.apache.poi.hssf.usermodel.HSSFWorkbook
import org.apache.poi.hssf.usermodel.HSSFCell
import org.apache.poi.hssf.usermodel.HSSFRow
import org.apache.poi.hssf.usermodel.HSSFDateUtil


Logger logger = LoggerFactory.getLogger("LoadMAPViolations")

ExecutionContext ec = Moqui.getExecutionContext()
ec.artifactExecution.disableAuthz()
//ec.transaction.begin(null)
EntityDefinition entityDef = ec.entity.getEntityDefinition("MAPViolationHistory")
logger.info("entityDef: ${entityDef}")
List fieldNames = entityDef.getAllFieldNames()
logger.info("fieldNames: ${fieldNames}")


        ResourceReference rr = ec.resource.getLocationReference("component:/rc/src/test/resources/MAPViolationHistory2.xls")
        logger.info("typeof rr: ${rr.getClass()}")
        InputStream stream = rr.openStream()
        /*
        ResourceReference rr = ec.resource.getLocationReference("file:/home/byersa/dev/moqui-rc/runtime/component/rc/src/test/resources/MAPViolationHistory2.xls")
        logger.info("typeof rr: ${rr.getClass()}")
        File f = rr.getFile()
        InputStream stream = new FileInputStream(f)
        */           
        //Get the workbook instance for XLS file 
        HSSFWorkbook wb = new HSSFWorkbook(stream)
         
  def sheets = [], i, rit, cols=0, cit
  HSSFRow row
  HSSFCell cell
  Object val
  String fieldName
  int l=wb.numberOfSheets
  for ( i=0; i<l; i++) {
    HSSFSheet sheet = wb.getSheetAt(i)
    int j=1, lastRowNum = sheet.getLastRowNum()
    while (j <= lastRowNum) {
      row = sheet.getRow(j)
      int k=0, lastCellNum = row.getLastCellNum() 
      Map <String, Object> violationMap=[:]
      while(k < lastCellNum) {
          cell = row.getCell(k)
          val = cellValue(cell)
          fieldName = fieldNames[k + 1] // skip mapViolationHistoryId
          if (val) {
               violationMap[fieldName] = val
          }
          k++
      }
      logger.info("violationMap: ${violationMap}")
      EntityValue violationValue = ec.entity.makeValue("MAPViolationHistory")
      entityDef.setFields(violationMap, violationValue, false, null, false)
      violationValue.setSequencedIdPrimary()
      logger.info("violationValue: ${violationValue}")
      violationValue.create()
      j++
    }
  }
   return


//ec.transaction.commit(null)
/**
 * Cell value extractor.
 * @param org.apache.poi.ss.usermodel.Cell cell A Cell.
 * @return String|Number|Date|null Depends on the cell's content.
 */
def cellValue(HSSFCell cell) {
  if (!cell) return null
  int t = cell.cellType
  if (t == HSSFCell.CELL_TYPE_NUMERIC) {
    if (HSSFDateUtil.isCellDateFormatted(cell)) return new Timestamp(cell.dateCellValue.time)
    else return cell.numericCellValue + 0.0
  }
  if (t == HSSFCell.CELL_TYPE_STRING) return cell.stringCellValue + ''
  if (t == HSSFCell.CELL_TYPE_FORMULA) {
    try {
      if (HSSFDateUtil.isCellDateFormatted(cell)) return new Timestamp(cell.dateCellValue.time)
      else return cell.numericCellValue + 0.0
    } catch(err) { }
    try { return cell.stringCellValue + '' } catch(err) { }
    try { return cell.numericCellValue + 0.0 } catch(err) { }
    try { return !!cell.booleanCellValue } catch(err) { }
    try { return cell.errorCellValue + 0 } catch(err) { }
    return ''
  }
  if (t == HSSFCell.CELL_TYPE_BLANK) return ''
  if (t == HSSFCell.CELL_TYPE_BOOLEAN) return !!cell.booleanCellValue
  if (t == HSSFCell.CELL_TYPE_ERROR) return cell.errorCellValue + 0
  return null
}
