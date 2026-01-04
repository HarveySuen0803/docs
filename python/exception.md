# catch Exception

```python
try:
    file = open('/Users/HarveySuen/Downloads/test1.txt', 'r')
except FileNotFoundError as e:
    print("FileNotFoundError:", e)
except Exception as e:
    print("Exception:", e)
else:
    print("no Exception")
finally:
    file.close()
```
