# install on Mac

install python

```shell
brew install python3
```

install pip

```shell
brew install pip3
```

check version

```shell
python3 --version
```

# install on Linux

install python

```shell
apt install python3
```

install pip

```shell
apt install pip3
```

check version

```shell
python3 --version
```

# basic command

```shell
python

python test.py
```

# variable

```python
n = 10;

msg = 'hello world'
```

# arithmetic operator

```python
n1 = 10 / 3 # 3.3333333333333335

n2 = 10 // 3 # 3

n3 = 10 % 3 # 1

n4 = 10 ** 2 # 100
```

# concat string

```python
msg = 'hello' + 'word'

msg = 'num: ' + 10 # TypeError: can only concatenate str (not 'int') to str

msg = 'name: %s, age: %d, sal: %f' % ('harvey', 18, 123.4)
msg = '%5d' % (123) # <space><space>123
msg = '%5.2f' % (123.4) # <space><space>123.40
msg = '%5.2f' % (123.45) # <space><space>123.45
msg = '%5.2f' % (123.456) # <space><space>123.46
msg = '%d' % (10 * 20)

name = 'harvey'
age = 18
msg = f'name: {name}, age: {age}'
msg = f'{10 * 20}'

```

# if

```python
age = 18

if age < 10:
    print('...')
elif age < 20:
    print('...')
else:
    print('...')
```

# while

```python
i = 0

while i < 10:
    print('...')
    i += 1
```

# for

```python
for i in range(10):
    print(i)

for w in 'hello world':
    print(w)

for name in ['sun', 'xue', 'cheng']:
    print(name)
```

# continue

```python
for i in range(10):
    if i == 5:
        continue
```

# break

```python
for i in range(10):
    if i == 5:
        break
```

# def

```python
def func(msg):
    return 'hello world'
    
msg = func('hello world')
```

## return multiple value

```python
def test():
    return 'sun', 'xue'
    
str1, str2 = test() # sun xue
```

## specify argument

```python
def test(name, age):
    print('hello world')
    
test(name='sun', age=18)

test(age=18, name='sun')
```

## default argument

```python
def test(name='', age=-1):
    print('hello world')
```

## uncertain argument

```python
def test(*args):
    print(args) # ('sun', 'xue', 'cheng')
    
test('sun', 'xue', 'cheng')

def test(**args):
    print(args) # {'name': 'sun', 'age': 18}
    
test(name='sun', age=18)
```

## pass function as argument

```python
def show(msg):
    print(msg)

def test(show):
    show('hello world')

test(show)
```

## pass lambda as argument

```python
def test(show):
    show('hello world')

test(lambda msg: print(msg))
```

# def document

```python
def add(num1, num2):
    """
    add() used for add two numbers
    :param num1: fist number
    :param num2: second number
    :return: and the two numbers
    """
    return num1 + num2
```

# global

```python
num = 10

def func():
    global num
    num = 20

func()

print(num) # 20
```

# str

```python
my_str = str()

my_str = ''

my_str = 'hello world'

my_str[0] # h
my_str[-1] # d

# can not modify value
my_str[0] = 'H'

# can modify reference
my_str = 'HELLO WORLD'
```

# list

```python
my_list = list()

my_list = []

my_list = ['sun', 'xue', 'cheng']
item = my_list[0] # sun
item = my_list[-1] # cheng

my_list = [['sun', 'xue'], ['cheng']]
item = my_list[0][0] # sun
```

# tuple

item of reference type of tuple can not be modified, similar to read-only list

```python
my_tuple = tuple()

my_tuple = ()

my_tuple = ('sun', 'xue', 'cheng')
item = my_tuple[0] # sun
item = my_tuple[-1] # cheng

my_tuple = (('sun', 'xue'), ('cheng',))
item = my_tuple[0][0] # sun

my_type = type(('sun')) # <class 'str'>
my_type = type(('sun',)) # <class 'tuple'>
my_type = type(('sun', 'xue', 'cheng')) # <class 'tuple'>

my_tuple = ('sun', 'xue', 'cheng', ['jack', 'tom'])

# can not modify reference
my_tuple[0] = 'SUN' # error

# can modify value
my_tuple[3][0] = 'JACK' # my_tuple: ('sun', 'xue', 'cheng', ['JACK', 'tom'])
```

# sequence

```python
my_list = ['sun', 'xue', 'cheng', 'jack', 'tom']

my_list = my_list[1:3] # ['xue', 'cheng']

my_list = my_list[:] # ['sun', 'xue', 'cheng', 'jack', 'tom']
```

# set

```python
my_set = set()

my_set = {} # warning

# auto duplicate removal
my_set = {'sun', 'xue', 'cheng', 'sun'} # {'sun', 'xue', 'cheng'}

# not support index
my_set[0] # error
```

# dict

```python
my_dict = dict()

my_dict = {} # warning

# key must be unique
my_dict = {'name': 'sun', 'age': 18, 'address': {'province': 'Jiangsu', 'city': 'Yangzhou'}}

# get value by key, not support index
my_dict['name'] # sun
my_dict['address']['province'] # Jiangsu

# update value
my_dict['name'] = 'xue'
```

# type conversion

```python
res = int(...)

res = float(...)

res = str(...)

res = list(...)

res = set(...)

res = tuple(...)

res = dict(...)
```

