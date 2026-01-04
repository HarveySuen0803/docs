# upload file

client upload file

```html
<form action="/upload" method="post" enctype="multipart/form-data">
    <input type="file" name="file">
</form>
```

server receive file

```java
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public void upload(MultipartFile file) {
    System.out.println(file.getOriginalFilename())
    System.out.println(file.getSize);
    System.out.println(file.getBytes());
    System.out.println(file.getInputStream());
    // local storage
    file.transferTo(new File("/Users/HarveySuen/Downloads", file.getOriginalFilename()));
}
```

multipart config

```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=100MB
```

# download file

```java
@GetMapping("/download")
public void download(HttpServletResponse response) throws Exception {
    FileInputStream inputstream = new FileInputStream("/Users/HarveySuen/Downloads/test.txt");
    ServletOutputStream outputstream = response.getOutputStream();
    response.setHeader("Content-Disposition", "attachment;filename=test.txt");
    response.setContentType("application/octet-stream");
    response.setCharacterEncoding("UTF-8");
    IOUtils.copy(inputStream, outputStream);
}
```