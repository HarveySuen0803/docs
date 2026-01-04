# 信号

在类 Unix 系统中，信号（signal） 是一种让操作系统与进程交互的“异步通知机制”，内核可以向进程发送信号，通知它发生了某个事件（例如用户按了 Ctrl+C、定时器超时、子进程退出等）。进程可以选择接受信号并终止、忽略信号、自己定义信号处理函数（通过 signal.signal()）。

![image.png](https://note-sun.oss-cn-shanghai.aliyuncs.com/image/20251102125749.png)

```c
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>

void handle_sigint(int sig) {
    printf("💥 收到 SIGINT (Ctrl+C)，正在安全退出...\n");
    exit(0);
}

void handle_sigtstp(int sig) {
    printf("⏸️ 收到 SIGTSTP (Ctrl+Z)，进程将暂停...\n");
    fflush(stdout);
}

void handle_sigcont(int sig) {
    printf("▶️ 收到 SIGCONT，继续运行...\n");
    fflush(stdout);
}

int main() {
    // 注册信号处理函数
    signal(SIGINT, handle_sigint);
    signal(SIGTSTP, handle_sigtstp);
    signal(SIGCONT, handle_sigcont);

    printf("进程 PID = %d\n", getpid());
    printf("尝试按 Ctrl+C (中断)、Ctrl+Z (暂停)、fg (恢复)\n");

    while (1) {
        printf("运行中...\n");
        sleep(2);
    }

    return 0;
}
```

```
$ gcc signal_demo.c -o signal_demo
$ ./signal_demo
进程 PID = 12345
尝试按 Ctrl+C (中断)、Ctrl+Z (暂停)、fg (恢复)
运行中...
运行中...
⏸️ 收到 SIGTSTP (Ctrl+Z)，进程将暂停...
# 终端中按 fg 恢复
▶️ 收到 SIGCONT，继续运行...
运行中...
💥 收到 SIGINT (Ctrl+C)，正在安全退出...
```

---

**信号的产生方式**

键盘产生：

- Ctrl + C → 产生 SIGINT
- Ctrl + Z → 产生 SIGTSTP
- fg 或 bg → 产生 SIGCONT

系统调用产生：

- kill(pid, SIGTERM)
- raise(SIGINT)  → 发送信号给自己
- alarm(5) → 5 秒后自动产生 SIGALRM

内核产生：

- 段错误时 → SIGSEGV
- 除以 0 → SIGFPE
- 子进程退出 → SIGCHLD

---

**信号的处理方式**

默认处理（default）：由内核定义，如终止、暂停、忽略等。

忽略信号（ignore）：程序可调用 signal(signum, SIG_IGN) 忽略。

自定义处理函数（catch）：使用 signal(signum, handler) 注册信号处理函数。

