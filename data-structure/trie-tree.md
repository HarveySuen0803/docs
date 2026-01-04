# 前缀树

前缀树是一种树形数据结构，用于高效地存储和检索字符串，特别是用来实现字典或自动补全功能。

- [Explain 00:00:00](https://www.bilibili.com/video/BV13g41157hK?vd_source=2b0f5d4521fd544614edfc30d4ab38e1&spm_id_from=333.788.player.switch&p=10)

```java
public class TrieTree {
    private Node root;

    public TrieTree() {
        this.root = new Node();
    }

    public static class Node {
        public int pass;
        public int end;
        public Map<Character, Node> nexts;

        public Node() {
            this.pass = 0;
            this.end = 0;
            this.nexts = new HashMap<>();
        }
    }

    public void insert(String word) {
        char[] chs = word.toCharArray();
        if (chs.length == 0) {
            return;
        }
        Node curr = root;
        for (char ch : chs) {
            curr.nexts.putIfAbsent(ch, new Node());
            curr = curr.nexts.get(ch);
            curr.pass++;
        }
        curr.end++;
    }

    public void delete(String word) {
        if (!exists(word)) {
            return;
        }
        char[] chs = word.toCharArray();
        Node prev = null;
        Node curr = root;
        for (char ch : chs) {
            prev = curr;
            curr = curr.nexts.get(ch);
            curr.pass--;
        }
        curr.end--;
        if (curr.end == 0) {
            prev.nexts.remove(chs[chs.length - 1]);
        }
    }

    public boolean exists(String word) {
        return countWord(word) > 0;
    }

    public int countWord(String word) {
        Node curr = root;
        for (char ch : word.toCharArray()) {
            // 如果查不到 ch，说明 Trie Tree 中不存在该 word
            curr = curr.nexts.get(ch);
            if (curr == null) {
                return 0;
            }
        }
        return curr.end;
    }

    public int countPrefix(String prefix) {
        Node curr = root;
        for (char ch : prefix.toCharArray()) {
            curr = curr.nexts.get(ch);
            // 如果查不到 ch，说明 Trie Tree 中不存在该 prefix
            if (curr == null) {
                return 0;
            }
        }
        return curr.pass;
    }

    public int size() {
        return root.pass;
    }
}
```
