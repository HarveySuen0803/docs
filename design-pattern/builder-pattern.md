# Builder Pattern

Factory Pattern 是一下子就封装了完整的 object, 而 Builder Pattern 是一步一步封装的 object, 更注重不同的 object 采用不同的封装方式

Builder Pattern 适合由多个 component 构成的 object, 不在乎构建顺序, 在乎 component 的变化

```java
@Data
class Computer {
    private String cpu;
    private String gpu;

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private Computer computer = new Computer();

        public void buildCpu(String cpu) {
            computer.setCpu(cpu);
        }

        public void buildGpu(String gpu) {
            computer.setGpu(gpu);
        }

        public Computer build() {
            return computer;
        }
    }
}
```

```java
Computer.Builder builder = Computer.builder();
builder.buildCpu("intel");
builder.buildGpu("nvidia");
Computer computer = builder.build();
```

# Chain Style

```java
@Data
class Computer {
    private String cpu;
    private String gpu;

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private Computer computer = new Computer();

        public Builder cpu(String cpu) {
            computer.setCpu(cpu);
            return this;
        }

        public Builder gpu(String gpu) {
            computer.setGpu(gpu);
            return this;
        }

        public Computer build() {
            return computer;
        }
    }
}
```

```java
Computer computer = Computer.builder()
                            .cpu("intel")
                            .gpu("nvidia")
                            .build();
```