# Valid Palindrome

[Problem Description](https://leetcode.cn/problems/valid-palindrome/?envType=study-plan-v2&envId=top-interview-150)

```java
public static boolean isPalindrome(String str) {
    str = cleanString(str);
    char[] chs = str.toCharArray();
    int l = 0;
    int r = chs.length - 1;
    while (l < r) {
        if (chs[l] != chs[r]) {
            return false;
        }
        l++;
        r--;
    }
    return true;
}

public static String cleanString(String str) {
    StringBuilder sb = new StringBuilder();
    char[] chs = str.toCharArray();
    for (char ch : chs) {
        if (
            (ch >= 'a' && ch <= 'z') || 
            (ch >= 'A' && ch <= 'Z') || 
            (ch >= '0' && ch <= '9')
        ) {
            sb.append(Character.toLowerCase(ch));
        }
    }
    return sb.toString();
}
```

# Is Subsequence

[Problem Description](https://leetcode.cn/problems/is-subsequence/?envType=study-plan-v2&envId=top-interview-150)

```java
public boolean isSubsequence(String pat, String str) {
    if (pat.length() == 0) {
        return true;
    }

    int idx = 0;
    for (int i = 0; i < str.length(); i++) {
        if (pat.charAt(idx) == str.charAt(i)) {
            if (++idx == pat.length()) {
                return true;
            }
        }
    }

    return false;
}
```

# Brute Force

```java
public static int search(String txt, String pat) {
    int i = 0;
    while (i < txt.length()) {
        while (txt.charAt(i) != pat.charAt(0)) {
            i++;
        }

        int j = 0;
        while (j < pat.length()) {
            if (txt.charAt(i + j) != pat.charAt(j++)) {
                break;
            }
        }

        if (j == pat.length()) {
            return i;
        }
    }

    return -1;
}
```

# Knuth Morris Pratt

```java
public static int search(char[] txt, char[] pat) {
    int[] lps = lps(pat);
    
    int i = 0;
    int j = 0;
    while (pat.length - j <= txt.length - i) {
        if (pat[j] == txt[i]) {
            i++;
            j++;
            if (j == pat.length) {
                return i - j;
            }
        } else if (j == 0) {
            i++;
        } else {
            j = lps[j - 1];
        }
    }
    
    return -1;
}

public static int[] lps(char[] pat) {
    int[] lps = new int[pat.length];
    int i = 1;
    int j = 0;

    while (i < pat.length) {
        if (pat[i] == pat[j]) {
            lps[i] = j + 1;
            i++;
            j++;
        } else if (j == 0) {
            i++;
        } else {
            j = lps[j - 1];
        }
    }

    return lps;
}

public static void main(String[] args) {
    System.out.println(Arrays.toString(lps("ababaca".toCharArray())));
}
```

# Add Strings

[Problem Description](https://leetcode.cn/problems/add-strings/description/)

[Explain](https://www.bilibili.com/video/BV1eg411w7gn?p=53&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public String addStrings(String num1, String num2) {
    StringBuilder sb = new StringBuilder();
    int carry = 0;
    int i1 = num1.length() - 1;
    int i2 = num2.length() - 1;
    while (i1 >= 0 || i2 >= 0 || carry == 1) {
        int n1 = i1 >= 0 ? num1.charAt(i1) - '0' : 0;
        int n2 = i2 >= 0 ? num2.charAt(i2) - '0' : 0;
        sb.append((n1 + n2 + carry) % 10);
        carry = (n1 + n2 + carry) / 10;
        i1--;
        i2--;
    }
    return sb.reverse().toString();
}
```

# Reverse Words in a String

[Problem Description](https://leetcode.cn/problems/reverse-words-in-a-string/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static String reverseWords(String str1) {
    String[] words = Arrays.stream(str1.split(" "))
            .filter(word -> !word.isEmpty())
            .toArray(String[]::new);

    StringBuilder sb = new StringBuilder();
    for (int i = words.length - 1; i > 0; i--) {
        sb.append(words[i]).append(" ");
    }
    sb.append(words[0]);

    return sb.toString();
}
```

# Zigzag Conversion

[Problem Description](https://leetcode.cn/problems/zigzag-conversion/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static String convert(String str, int numRows) {
    // 如果 numRows == 1 或字符串长度小于等于行数，则无需 Zigzag 排列，直接返回字符串即可。
    if (numRows == 1) return str;

    // 存储每一行的字符串
    StringBuilder[] sbs = new StringBuilder[numRows];
    for (int i = 0; i < sbs.length; i++) {
        sbs[i] = new StringBuilder();
    }

    char[] chs = str.toCharArray();
    int row = 0;
    int direction = 1; // 1 向下，2 向上
    for (char ch : chs) {
        sbs[row].append(ch);
        // 按行顺序向下填充字符
        if (direction == 1) {
            if (row == numRows - 1) {
                row--;
                direction = 2;
            } else {
                row++;
            }
        }
        // 按行逆序向上填充字符
        else {
            if (row == 0) {
                row++;
                direction = 1;
            } else {
                row--;
            }
        }
    }

    StringBuilder res = new StringBuilder();
    for (StringBuilder sb : sbs) {
        res.append(sb);
    }

    return res.toString();
}
```

# Roman to Integer

[Problem Description](https://leetcode.cn/problems/roman-to-integer/description/?envType=study-plan-v2&envId=top-interview-150)

```java
public static int romanToInt(String str) {
    Map<Character, Integer> map = new HashMap<>();
    map.put('I', 1);
    map.put('V', 5);
    map.put('X', 10);
    map.put('L', 50);
    map.put('C', 100);
    map.put('D', 500);
    map.put('M', 1000);

    char[] chs = str.toCharArray();
    int i = 0;
    int res = 0;
    while (i < chs.length) {
        if (
            (i < chs.length - 1 && chs[i] == 'I' && (chs[i + 1] == 'V' || chs[i + 1] == 'X')) ||
            (i < chs.length - 1 && chs[i] == 'X' && (chs[i + 1] == 'L' || chs[i + 1] == 'C')) ||
            (i < chs.length - 1 && chs[i] == 'C' && (chs[i + 1] == 'D' || chs[i + 1] == 'M'))
        ) {
            res += map.get(chs[i + 1]) - map.get(chs[i]);
            i += 2;
        } else {
            res += map.get(chs[i]);
            i += 1;
        }
    }

    return res;
}
```

# Integer to Roman

[Problem Description](https://leetcode.cn/problems/integer-to-roman/description/?envType=study-plan-v2&envId=top-interview-150)

将整数转为罗马数字的基本方法是从最大数值开始逐步减去，直到数值为 0。我们可以使用贪心算法：

1. 预定义罗马数字和对应的数值：使用两个数组，存储所有可能的罗马数字组合及其对应的数值，从大到小排列。
2. 贪心法构建罗马数字：从最大数值开始，尝试将数值减去。每次匹配成功，就在结果字符串中追加对应的罗马数字。

```java
public String intToRoman(int num) {
    int[] values = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    String[] symbols = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};

    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < values.length; i++) {
        while (num >= values[i]) {
            num -= values[i];
            sb.append(symbols[i]);
        }
    }

    return sb.toString();
}
```

# Find the Index of the First Occurrence in a String

[Problem Description](https://leetcode.cn/problems/find-the-index-of-the-first-occurrence-in-a-string/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=183&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static int strStr(String haystack, String needle) {
    char[] chs = haystack.toCharArray();
    char[] pat = needle.toCharArray();
    for (int i = 0; i < chs.length - pat.length + 1; i++) {
        boolean flag = true;
        for (int j = 0; j < pat.length; j++) {
            if (pat[j] != chs[i + j]) {
                flag = false;
                break;
            }
        }
        if (flag) {
            return i;
        }
    }
    return -1;
}
```

# Longest Common Prefix

[Problem Description](https://leetcode.cn/problems/longest-common-prefix/description/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=186&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static String longestCommonPrefix(String[] strs) {
    char[] chs = strs[0].toCharArray();
    for (int idx = 0; idx < chs.length; idx++) {
        char ch = chs[idx];
        for (int i = 0; i < strs.length; i++) {
            String str = strs[i];
            if (str.length() == idx || str.charAt(idx) != ch) {
                return new String(chs, 0, idx);
            }
        }
    }
    return strs[0];
}
```

# Longest Palindromic Substring

[Problem Description](https://leetcode.cn/problems/longest-palindromic-substring/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=187&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
/**
 * The algorithm employs the idea of expanding around the center to find the longest palindromic substring.
 * It iterates through each character in the string and considers both odd-length and even-length palindromes
 * with the current character(s) as the center. The `extend` method is used to check and extend palindromes.
 * 
 * Algorithm Steps:
 * 1. Initialize variables `left` and `right` to store the indices of the longest palindromic substring.
 * 2. Convert the input string to a character array for efficient indexing.
 * 3. Iterate through each character in the string using a for loop.
 * 4. For each character, call the `extend` method twice, considering both odd-length and even-length palindromes.
 * 5. The `extend` method checks and extends palindromes by comparing characters while moving outward from the center.
 * 6. After the loop, return the longest palindromic substring using the indices `left` and `right`.
 * 
 * @param s The input string in which to find the longest palindromic substring.
 * @return The longest palindromic substring found in the input string.
 */
public static String longestPalindrome(String s) {
    // Initialize variables to store the indices of the longest palindromic substring
    left = 0;
    right = 0;

    // Convert the input string to a character array for efficient indexing
    char[] chs = s.toCharArray();

    // Iterate through each character in the string
    for (int i = 0; i < chs.length - 1; i++) {
        // Consider both odd-length and even-length palindromes with the current character(s) as the center
        extend(chs, i, i);
        extend(chs, i, i + 1);
    }

    // Return the longest palindromic substring using the indices left and right
    return new String(chs, left, right - left + 1);
}

/**
 * Checks and extends palindromes by comparing characters while moving outward from the center.
 * Updates the indices `left` and `right` if a longer palindrome is found.
 * 
 * @param chs The character array representing the input string.
 * @param i The left index of the potential palindrome.
 * @param j The right index of the potential palindrome.
 */
public static void extend(char[] chs, int i, int j) {
    // Move outward from the center while characters match
    while (i >= 0 && j <= chs.length - 1 && chs[i] == chs[j]) {
        i--;
        j++;
    }

    // Adjust indices to represent the valid palindrome
    i++;
    j--;

    // Update indices if a longer palindrome is found
    if (j - i > right - left) {
        left = i;
        right = j;
    }
}
```

# Minimum Window Substring

[Problem Description](https://leetcode.cn/problems/minimum-window-substring/)

[Explain](https://www.bilibili.com/video/BV1rv4y1H7o6/?p=188&spm_id_from=pageDriver&vd_source=2b0f5d4521fd544614edfc30d4ab38e1)

```java
public static String minWindow(String str, String ptn) {
    int[] strCount = new int[128];
    int[] ptnCount = new int[128];
    for (char ch : ptn.toCharArray()) {
        ptnCount[ch]++;
    }
    
    int l = 0;
    int r = 0;
    int len = 0;
    int lRes = -1;
    int rRes = -1;
    while (r < str.length()) {
        char rCh = str.charAt(r);
        strCount[rCh]++;
        if (ptnCount[rCh] != 0 && strCount[rCh] <= ptnCount[rCh]) {
            len++;
        }
        while (len == ptn.length() && l <= r) {
            if (rRes == -1 || (r - l) < (rRes - lRes)) {
                lRes = l;
                rRes = r;
            }
            char lCh = str.charAt(l);
            strCount[lCh]--;
            if (strCount[lCh] < ptnCount[lCh]) {
                len--;
            }
            l++;
        }
        r++;
    }
    
    return rRes != -1 ? str.substring(lRes, rRes + 1) : "";
}

public static void main(String[] args) {
    System.out.println(minWindow("ADOBECODEBANC", "ABC")); // BANC
}
```

# Subarray Sum Equals K

[Problem Description](https://leetcode.cn/problems/subarray-sum-equals-k/description/?envType=study-plan-v2&envId=top-100-liked)

```java
public static int subarraySum(int[] nums, int tarSum) {
    int count = 0;
    for (int i = 0; i < nums.length; i++) {
        int curSum = 0;
        for (int j = i; j < nums.length; j++) {
            curSum += nums[j];
            if (curSum == tarSum) {
                count++;
            }
        }
    }
    return count;
}
```

# Subarray Sum Equals K

```java
/**
 * This function uses the prefix sum method. It iterates the given array, storing the sum from start to the
 * current number in the HashMap. If the current sum minus tarSum has appeared in HashMap before
 * it means that we have found a subarray that adds up to tarSum.
 *
 * Example:
 * nums = [3, 4, 7, 2, -3, 1, 4, 2], tarSum = 7
 * Prefix sums array: [3, 7, 14, 16, 13, 14, 18, 20]
 * 7 appears once before 14, so we have two subarrays ([3, 4], [7]) that add up to 7.
 *
 * Extended Example:
 * Assume nums = [3, 4, 7, 2, -3, 1, 4, 2], tarSum = 7.
 *
 * 1. Initialization: count = 0, curSum = 0, map = [(0,1)]
 *
 * 2. For number 3:
 *     curSum = 3
 *     No record of (3-7) in map.
 *     map becomes [(0,1), (3,1)]
 *
 * 3. For number 4:
 *     curSum = 7
 *     There is record of (7-7) in map, so count += 1.
 *     map becomes [(0,1), (3,1), (7,1)]
 *
 * 4. For number 7:
 *     curSum = 14
 *     There is record of (14-7) in map, so count += 1.
 *     map becomes [(0,1), (3,1), (7,1), (14,1)]
 *
 * 5. For number 2:
 *     curSum = 16
 *     No record of (16-7) in map.
 *     map becomes [(0,1), (3,1), (7,1), (14,1), (16,1)]
 *
 * 6. For number -3:
 *     curSum = 13
 *     No record of (13-7) in map.
 *     map becomes [(0,1), (3,1), (7,1), (14,1), (16, ```java
 *     1), (13,1)]
 *
 * 7. For number 1:
 *     curSum = 14
 *     There is a record of (14-7) in map, so count += 1.
 *     map becomes [(0,1), (3,1), (7,1), (14,2), (16,1), (13,1)]
 *
 * 8. For number 4:
 *     curSum = 18
 *     No record of (18-7) in map.
 *     map becomes [(0,1), (3,1), (7,1), (14,2), (16,1), (13,1), (18,1)]
 *
 * 9. For number 2:
 *     curSum = 20
 *     No record of (20-7) in map.
 *     map becomes [(0,1), (3,1), (7,1), (14,2), (16,1), (13,1), (18,1), (20,1)]
 *
 * So, the final result is count = 2, which represents there are 2 subarrays ([3, 4] and [7]) with sum equal to tarSum.
 * 
 * Special Cases Consideration:
 * There may be negative numbers in the input array, so we can't just consider that the sum should be increasing.
 * If tarSum is 0, the output should not always be 0. For example, in the array [0, 0], there are 3 subarrays that sum to 0.
 * Therefore, we initialize the HashMap with (0, 1) to correctly handle the situation where the subarray starts from the beginning of the array.
 */
public static int subarraySum(int[] nums, int tarSum) {
    // Initialize the counter for the number of valid subarrays
    int count = 0;
    
    // This is to record the cumulative sum of the numbers from the beginning to the current position
    int curSum = 0;
    
    // Use HashMap to record the number of occurrences of each sum
    HashMap<Integer, Integer> map = new HashMap<>();
    
    // Put (0,1) into the HashMap to handle the case where the subarray starts from the beginning of the array
    map.put(0, 1);
    
    // Iterate through the input array
    for (int num : nums) {
        // For each number, add it to the cumulative sum
        curSum += num;
        // If the current sum minus tarSum has appeared before, add the corresponding count to our counter
        if (map.containsKey(curSum - tarSum)) {
            count += map.get(curSum - tarSum);
        }
        // Update the map with the current sum
        map.put(curSum, map.getOrDefault(curSum, 0) + 1);
    }
    
    // Return the total count of the subarrays where the sum equals to tarSum
    return count;
}
```

# Text Justification

[Problem Description](https://leetcode.cn/problems/text-justification/?envType=study-plan-v2&envId=top-interview-150)

```java
public static List<String> fullJustify(String[] words, int maxWidth) {
    List<String> res = new ArrayList<>();
    List<String> rowWords = new ArrayList<>();
    int idx = 0;
    while (idx < words.length) {
        String word = words[idx];
        int tarRowWidth = getTarRowWidth(rowWords, word);
        // 当前行可以塞得下该单词
        if (tarRowWidth <= maxWidth) {
            rowWords.add(word);
            idx++;
        }
        // 当前行无法塞下该单词了，需要将行的数据收录到 res 中，重新开启一行存放该单词
        else {
            res.add(buildRowString(rowWords, maxWidth));
            rowWords = new ArrayList<>();
        }
    }

    if (rowWords.size() != 0) {
        res.add(buildLastRowString(rowWords, maxWidth));
    }

    return res;
}

private static String buildRowString(List<String> rowWords, int maxWidth) {
    if (rowWords.size() == 1) {
        StringBuilder sb = new StringBuilder();
        String word = rowWords.get(0);
        String space = buildSpace(maxWidth - word.length());
        sb.append(word).append(space);
        return sb.toString();
    } else {
        int wordsWidth = getWordsWidth(rowWords);
        int normalIntervalWidth = (maxWidth - wordsWidth) / (rowWords.size() - 1);
        int extraIntervalWidth = (maxWidth - wordsWidth) % (rowWords.size() - 1);

        String normalSpace = buildSpace(normalIntervalWidth);

        StringBuilder rowString = new StringBuilder();
        for (int i = 0; i < rowWords.size() - 1; i++) {
            rowString.append(rowWords.get(i)).append(normalSpace);
            if (extraIntervalWidth > 0) {
                rowString.append(" ");
                extraIntervalWidth--;
            }
        }
        rowString.append(rowWords.get(rowWords.size() - 1));

        return rowString.toString();
    }
}

private static String buildLastRowString(List<String> rowWords, int maxWidth) {
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < rowWords.size() - 1; i++) {
        sb.append(rowWords.get(i)).append(" ");
    }
    sb.append(rowWords.get(rowWords.size() - 1))
            .append(buildSpace(maxWidth - sb.length()));
    return sb.toString();
}

private static int getWordsWidth(List<String> words) {
    int totalWidth = 0;
    for (String word : words) {
        totalWidth += word.length();
    }
    return totalWidth;
}

private static int getTarRowWidth(List<String> rowWords, String word) {
    // 当前单词的长度
    int wordWidth = word.length();
    // 两个单词至少需要一个空格作间隔，三个单词至少需要两个空格作间隔
    int intervalWidth = rowWords.size() - 1;
    // 获取之前累计的单词的总长度
    int wordsWidth = getWordsWidth(rowWords);
    // 当前行长度 = 之前累计的单词长度 + 该单词长度 + 间隔长度
    int curRowWidth = wordsWidth + intervalWidth;
    // 如果想要新增该单词到 rowWords 中需要的长度，就是在 curRowWidth 的基础上，加上一个单词的长度和一个间隔
    return curRowWidth + wordWidth + 1;
}

private static String buildSpace(int intervalWidth) {
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < intervalWidth; i++) {
        sb.append(" ");
    }
    return sb.toString();
}
```