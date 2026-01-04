# Cookie

响应 Cookie

```java
public void test1(HttpServletResponse resp) {
    Cookie cookie = new Cookie("name", "sun");
    cookie.setMaxAge(60 * 60 * 24 * 7);
    resp.addCookie(cookie);
}
```

获取 Cookie

```java
public void test2(HttpServletRequest req) {
    Cookie[] cookies = req.getCookies();

    for (Cookie cookie : cookies) {
        // Cookie 的 key
        String key = cookiegetName();
        // Cookie 的 value
        String value = cookiegetValue();
    }
}
```

# Session

响应 Session

```java
public void test1(HttpServletRequest req) {
    HttpSession session = req.getSession();
    session.setAttribute("name", "sun");
}
```

获取 Session

```java
public void test2(HttpServletRequest req) {
    HttpSession session = req.getSession();
    object name = session.getAttribute("name");
}
```
