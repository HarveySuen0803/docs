# read file

```python
file = open('/Users/HarveySuen/Downloads/test.txt')

# read 10 bytes
str1 = file.read(10)

# continue read 10 bytes
str2 = file.read(10)

# read line
str3 = file.readline()

# read line list
str4 = file.readlines()

file.close()
```

# read in cycle

```python
for line in file:
    print(line)
```

# auto close file

```python
with open('/Users/HarveySuen/Downloads/test.txt') as file:
    print(file.readlines())
```

# write file

```python
# over write
file = open('/Users/HarveySuen/Downloads/test.txt', 'w', encoding='UTF-8')

# append write
file = open('/Users/HarveySuen/Downloads/test.txt', 'a', encoding='UTF-8')

file.write('hello world')

# auto invoke file.flush() to flush file
file.close()
```

