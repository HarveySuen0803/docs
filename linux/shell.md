# Execute Script

Give Execute Permission.

```shell
chmod +x test.sh
```

Execute through the current shell.

```shell
source test.sh

. ./test.sh
```

Execute through the sub shell.

```shell
bash test.sh

./test.sh
```

# Global Variable

View all global variable.

```shell
env

printenv
```

View the specified global variables.

```shell
printenv USER
```

Create global variable.

```shell
msg="hello world"

export msg
```

# Local Variable

View all local variable.

```shell
set
```

Create local variable.

```shell
name=harvey
age=18
msg="hello world"

echo $name
```

Operate variable.

```shell
a=10
a=10 + 1 # 10+1
a=[10 + 1] # 11
a=((10 + 1)) # 11

readonly b=10
b=20 # error

unset a
unset b # error
```

# Position Parameter

Set position parameters.

```shell
#!/bin/bash
echo $0
echo $1
echo $2
```

Passing parameters to position parameters when executing a script.

```shell
./test.sh param1 param2 param3
```

# Special Paramter

```shell
# Number of position paramter received
echo $# 

# All received parameters, encapsulate all parameters as a whole
echo $*

# All received parameters, scattered parameters, which can be directly traversed
echo $@

# The return status of the last command (eg: execute correctly is 0, "command not found" is 127)
echo $?
```

# expr

```shell
expr 1 + 2 # 3

expr 2 - 1 # 1

expr 2 \* 5 # 10

expr 5 \/ 2 # 2
```

# Command Substitution

Use the result of a command for assignment.

```shell
res=$(expr 1 + 1)

res=`expr 1 + 1`
```

# Conditional Judgement

```shell
test 1 = 1 # 0
test 1 = 2 # 1

test $name = harvey # 0
test $name = Harvey # 1

[ ] # 1
[ 1 ] # 0
[ 1 = 1 ] # 0
[ 1 != 2 ] # 0

[ 1 -eq 1 ] # 0
[ 1 -lt 3 ] # 0
[ 3 -gt 1 ] # 0

[ -r test.sh ]
[ -w test.sh ]
[ -x test.sh ]
[ -e test.sh ]
[ -f test.sh ]
[ -d test.sh ]

[ 1 = 1 ] && [ 2 = 2 ]
[ 1 = 1 ] || [ 2 = 2 ]
# Similar to `[ 1 = 1 ] && [ 2 = 2 ]`
[ 1 = 1 -a 2 = 2 ]

# Similar to ternary operator
[ -e test.sh] && echo 'file exists' || 'file does not exist'

# The tip when judging, avoid reporting errors, similar to the default value
[ "$1"x = "harvey"x ]
```

# if

```shell
if [ 1 ]; then echo 'ok'; fi

if [ 1 ]
then
    echo "..."
elif [ 1 ]
then 
    echo "..."
else
    echo "..."
fi
```

# case

```shell
case $1 in
    1)
        echo "1"
        ;;
    2)
        echo "2"
        ;;
    3)
        echo "3"
        ;;
    *)
        echo "..."
        ;;
esac
```

# for

```shell
for (( i=1; i <= $1; i++ ))
do
    sum=$[ $sum + $i ]
done

for i in 1 2 3 4 5 
do
    sum=$[ $sum + $i ]
done

for i in {1..100}
do
    sum=$[ $sum + $i ]
done

# $* and $@ have no difference and can be used to traverse
for param in $*
do
    echo $param
done

for param in $@
do
    echo $param
done

# "$*" is to take the received parameters as a whole. For example, if 1 2 3 4 is received, it will be encapsulated into a $param, which cannot be used for traversal.
for param in "$*"
do
    echo $param
done

# "$@" is the same as $@, no difference, can be used to traverse
for param in "$@"
do
    echo $param
done
```

# while

```shell
i=1
while [ $i -le 100 ]
do
    sum=$[ $sum + $i ]
    i=$[ $i + 1 ]
done
```

# let

```shell
let sum=10
let sum++
echo $sum
```

# read

```shell
read -p "input name: " -t 10 name
```

# basename

```shell
basename /home/harvey/tmp/test.sh # test.sh

basename /home/harvey/tmp/test.sh .sh # test
```

# dirname

```shell
dirname /home/harvey/tmp/test.sh # /home/harvey/tmp

dirname ./tmp/test/test.sh # ./tmp

echo abs_dir: $(cd $(dirname $0); pwd)
```

# function

```shell
function add() {
    sum=$[ $1 + $2 ]
    echo $sum
}

read -p "num1: " num1
read -p "num2: " num2

sum=$(add $num1 $num2)

echo "res: " $sum
```

# Exercise

## Daily Archive

```shell
#!/bin/bash

if [ $# -ne 1 ]; then
    echo "Error, please enter the directory name"
    exit
fi

if [ ! -d $1 ]; then
    echo "Error, no such directory name"
    exit
fi

DIR_NAME=$(basename $1)
DIR_PATH=$(cd $(dirname $1); pwd)

DATE=$(date +%y%m%d)
FILE=archive_${DIR_NAME}_$DATE.tar.gz

DEST=/home/harvey/archive/$FILE

tar zcfP $DEST $DIR_PATH/$DIR_NAME

if [ $? -eq 0 ]; then
    echo "Archived successfully, save files in $DEST"
fi

exit
```