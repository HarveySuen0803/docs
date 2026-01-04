# Iterator Pattern

```java
public class Main {
    public static void main(String[] args) {
        BookShelf bookShelf = new BookShelf();
        bookShelf.add(new Book());
        bookShelf.add(new Book());
        bookShelf.add(new Book());
        
        Iterator iterator = bookShelf.iterator();
        while (iterator.hasNext()) {
            System.out.println((Book) iterator.next());
        }
    }
}

class Book {}

class BookShelf {
    private List<Book> bookList;
    
    public BookShelf() {
        bookList = new ArrayList<>();
    }
    
    public void add(Book book) {
        bookList.add(book);
    }
    
    public Iterator iterator() {
        return new BookIterator();
    }
    
    public class BookIterator implements Iterator {
        private int index = 0;
        
        @Override
        public boolean hasNext() {
            return index < bookList.size();
        }
        
        @Override
        public Object next() {
            return bookList.get(index++);
        }
    }
}
```

