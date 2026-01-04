# import module

```python
import time 

time.sleep(10)
```

```python
from time import sleep

sleep(10)
```

```python
from time import *

sleep(10)
```

# alias module

```python
import time as t

t.sleep(10)

from time import sleep as sl

sl(10)
```

# \_\_name\_\_

```python
def test():
    print("hello world")

# test function in this file through __name__
if __name__ == '__main__':
    test()
```

## \_\_all\_\_

set module (file. my_module.py)

```python
__all__ = ['test1']

def test1():
    print("hello world")

def test2():
    print("hello world")
```

imort module to use function

```python
from my_module import *

test1()
test2() # error
```

# package

project strucuture

```
demo
├── main.py
└── my_package
    ├── __init__.py
    └── my_module.py
```

set package (file. \_\_init\_\_.py)

```python
__all__ = ['my_module']
```

import module

```python
import my_package.my_module

my_package.my_module.test()
```

```python
from my_package import my_module

my_module.test()
```
