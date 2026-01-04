# Resource Usage is too High

通过 `top` 查看资源占用情况, 确定占用资源较多的进程的 pid

通过 `ps H -eo pid,tid,%cpu | grep <pid>` 确定占用资源的线程的 tid

通过 `jstack <pid>` 诊断该进程中的线程问题, 根据 tid 确定到具体代码的那一行有问题

