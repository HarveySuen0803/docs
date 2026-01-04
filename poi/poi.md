# POI

import denpendency

```xml
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
</dependency>

<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
</dependency>
```

write to excel

```java
XSSFWorkbook excel = new XSSFWorkbook();
XSSFSheet sheet = excel.createSheet("info");

XSSFRow row = sheet.createRow(0);
row.createCell(0).setCellValue("sun");
row.createCell(1).setCellValue("xue");
row.createCell(2).setCellValue("cheng");

row = sheet.createRow(1);
row.createCell(0).setCellValue("jack");
row.createCell(1).setCellValue("tom");

FileOutputStream fos = new FileOutputStream("/Users/HarveySuen/Downloads/test.xlsx");
excel.write(fos);

fos.close();
excel.close();
```

read from excel

```java
FileInputStream fis = new FileInputStream("/Users/HarveySuen/Downloads/test.xlsx");
XSSFWorkbook excel = new XSSFWorkbook(fis);
XSSFSheet sheet = excel.getSheetAt(0);

int lastRowNum = sheet.getLastRowNum();
for (int i = 0; i <= lastRowNum; i++) {
    XSSFRow row = sheet.getRow(i);
    short lastCellNum = row.getLastCellNum();
    for (int j = 0; j <= lastCellNum; j++) {
        XSSFCell cell = row.getCell(j);
        if (cell == null) {
            continue;
        }
        System.out.print(cell + " ");
    }
    System.out.println();
}

fis.close();
excel.close();
```