# common API

## print()

```python
print('hello world')

print('h', 'e', 'l', 'l', 'o')

print('msg: ' + 'hello world')
```

## input()

```python
msg = input() # <class 'str'>

msg = input('input: ')
```

## type()

```python
msg_string = type('hello') # <class 'str'>

int_type = type(10) # <class 'int'>

float_type = type(3.14) # <class 'float'>

bool_type = type(True) # <class 'bool'>

none_type = type(None) # <class 'None'>

list_type = type(['sun', 'xue', 'cheng']) # <class 'list'>

tuple_type = type(('sun', 'xue', 'cheng')) # <class 'tuple'>
```

## range()

```python
ran = range(5) # 0, 1, 2, 3, 4

ran = range(1, 5) # 1, 2, 3, 4

ran = range(1, 5, 2) # 1, 3
```

## len()

```python
my_list = [3, 1, 4, 5, 9]

res = len(my_list) # 5
```

## max()

```python
my_list = [3, 1, 4, 5, 9]

res = max(my_list) # 9
```

## min()

```python
my_list = [3, 1, 4, 5, 9]

res = min(my_list) # 1
```

## sorted()

```python
my_list = [3, 1, 4, 5, 9]

res = sorted(my_list) # [1, 3, 4, 5, 9]

res = sorted(my_list, reverse=True) # [9, 5, 4, 3, 1]
```

# random API

## randint()

```python
num = random.randint(1, 10);
```

# str API

## index()

```python
my_str = 'hello world'

res = my_str.index('l') # 2
```

## count()

```python
my_str = 'hello world'

res = my_str.count('l') # 3
```

## replace()

```python
my_str = 'hello world'

my_str = my_str.replace('hello', 'HELLO') # HELLO world
```

## split()

```python
my_str = 'hello world'

str_to_list = my_str.split(' ') # ['hello', 'world']
```

## strip()

```python
my_str = ' hello world '

# remove ' '
my_str = my_str.strip() # hello world

my_str = '123hello world321'

# remove '123' and '321'
my_str = my_str.strip('123') # hello world
```

# list API

## index()

```python
my_list = ['sun', 'xue', 'cheng']

res = my_list.index('sun') # 0
```

## count()

```python
my_list = ['sun', 'xue', 'sun', 'cheng', 'sun']

res = my_list.count('sun') # 3
```

## insert()

```python
my_list = ['sun', 'xue', 'cheng']

my_list.insert(1, 'jack') # my_list: ['sun', 'jack', 'xue', 'cheng']
```

## append()

```python
my_list = ['sun', 'xue', 'cheng']

my_list.append('jack') # my_list: ['sun', 'xue', 'cheng', 'jack']
```

## extend()

```python
my_list = ['sun', 'xue', 'cheng']

my_list.extend(['jack', 'tom']) # my_list: ['sun', 'xue', 'cheng', 'jack', 'tom']
```

## del()

```python
my_list = ['sun', 'xue', 'cheng']

del my_list[0] # my_list: ['xue', 'cheng']
del(my_list[0]) # # my_list: ['cheng']
```

## pop()

```python
my_list = ['sun', 'xue', 'cheng']

res = my_list.pop(0) # sun
```

## remove()

```python
my_list = ['sun', 'xue', 'cheng', 'sun']

my_list.remove('sun') # my_list: ['xue', 'cheng', 'sun']
```

## clear()

```python
my_list = ['sun', 'xue', 'cheng', 'sun']

my_list.clear() # my_list: []
```

# tuple API

## index()

```python
my_tuple = ('sun', 'xue', 'cheng')

res = my_tuple.index('sun') # 0
```

## count()

```python
my_tuple = ('sun', 'xue', 'sun', 'cheng', 'sun')

res = my_tuple.count('sun') # 3
```

# set API

## add()

```python
my_set.add('sun')
```

## pop()

```python
res = my_set.pop()
```

## clear()

```python
my_set.clear()
```

## difference()

```python
set1 = {'sun', 'xue', 'cheng'}
set2 = {'cheng', 'jack', 'tom'}
res = set1.difference(set2) # {'sun', 'xue'}
```

## difference_update()

```python
set1 = {'sun', 'xue', 'cheng'}
set2 = {'cheng', 'jack', 'tom'}
set1.difference_update(set2) # set1: {'sun', 'xue'}, set2: {'cheng', 'tom', 'jack'}
```

## union()

```python
set1 = {'sun', 'xue', 'cheng'}
set2 = {'cheng', 'jack', 'tom'}
res = set1.union(set2) # {'sun', 'xue', 'cheng', 'jack', 'tom'}
```

# dict API

## pop()

```python
res = my_dict.pop('name') # res: sun
```

## clear()

```python
my_dict.clear()
```

## keys()

```python
keys = my_dict.keys() # <class 'dict_keys'>
```

## values()

```python
values = my_dict.values() # <class 'dict_values'>
```



