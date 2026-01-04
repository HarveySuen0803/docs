# String, StringBuffer, StringBuilder

String 是不可变字符串, 字符串存储在 final byte[] value 中, 无法修改数组内容, 只能修改数组的指向

StringBuilder 是可变字符串, 字符串存储在父类 AbstractStringBuilder 的 byte[] value 中, 可以修改数组内容, 相比 String 效率更高

StringBuffer 是可变字符串, 和 StringBuilder 类似, 但是 append() 和 delete() 都通过 synchronized 修饰来保证了线程安全

