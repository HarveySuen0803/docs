# AggregateFunctionWindowFunnel

createAggregateFunctionWindowFunnel (25.55)

```cpp
AggregateFunctionPtr
createAggregateFunctionWindowFunnel(const std::string & name, const DataTypes & arguments, const Array & params, const Settings *)
{
    // ...
    bool strict_once = params.size() > 1 && std::any_of(params.begin() + 1, params.end(), [](const auto & f) { return f.template safeGet<String>() == "strict_once"; });
    if (strict_once)
    {
        AggregateFunctionPtr res(createWithUnsignedIntegerType<AggregateFunctionWindowFunnel, AggregateFunctionWindowFunnelStrictOnceData>(*arguments[0], arguments, params));
        WhichDataType which(arguments.front().get());
        if (res)
            return res;
        if (which.isDate())
            return std::make_shared<AggregateFunctionWindowFunnel<DataTypeDate::FieldType, AggregateFunctionWindowFunnelStrictOnceData<DataTypeDate::FieldType>>>(arguments, params);
        if (which.isDateTime())
            return std::make_shared<AggregateFunctionWindowFunnel<DataTypeDateTime::FieldType, AggregateFunctionWindowFunnelStrictOnceData<DataTypeDateTime::FieldType>>>(arguments, params);
    }
    else
    {
        AggregateFunctionPtr res(createWithUnsignedIntegerType<AggregateFunctionWindowFunnel, AggregateFunctionWindowFunnelData>(*arguments[0], arguments, params));
        WhichDataType which(arguments.front().get());
        if (res)
            return res;
        if (which.isDate())
            return std::make_shared<AggregateFunctionWindowFunnel<DataTypeDate::FieldType, AggregateFunctionWindowFunnelData<DataTypeDate::FieldType>>>(arguments, params);
        if (which.isDateTime())
            return std::make_shared<AggregateFunctionWindowFunnel<DataTypeDateTime::FieldType, AggregateFunctionWindowFunnelData<DataTypeDateTime::FieldType>>>(arguments, params);
    }
    throw Exception(ErrorCodes::ILLEGAL_TYPE_OF_ARGUMENT,
                    "Illegal type {} of first argument of aggregate function {}, must "
                    "be Unsigned Number, Date, DateTime", arguments.front().get()->getName(), name);
}
```

createAggregateFunctionWindowFunnel (bili-24.8)

```cpp
template <template <typename> class Data>
AggregateFunctionPtr
createAggregateFunctionWindowFunnel(const std::string & name, const DataTypes & arguments, const Array & params, const Settings *)
{
    // ...
    AggregateFunctionPtr res(createWindowFunnelWithUnsignedIntegerType<AggregateFunctionWindowFunnel, Data, false>(*arguments[0], arguments, params));
    WhichDataType which(arguments.front().get());
    if (res)
        return res;
    else if (which.isDate())
        return std::make_shared<AggregateFunctionWindowFunnel<DataTypeDate::FieldType, Data<DataTypeDate::FieldType>, false>>(arguments, params);
    else if (which.isDateTime())
        return std::make_shared<AggregateFunctionWindowFunnel<DataTypeDateTime::FieldType, Data<DataTypeDateTime::FieldType>, false>>(arguments, params);
    else if (which.isArray())
    {
        // get nested data type
        const auto & type_array = assert_cast<const DataTypeArray &>(*arguments[0]);
        WhichDataType nested_type(type_array.getNestedType());
        if (nested_type.isUInt())
            return AggregateFunctionPtr(createWindowFunnelWithUnsignedIntegerType<AggregateFunctionWindowFunnel, Data, true>(
                *type_array.getNestedType(), arguments, params));
        else if ((nested_type.isDate()))
            return std::make_shared<AggregateFunctionWindowFunnel<DataTypeDate::FieldType, Data<DataTypeDate::FieldType>, true>>(
                arguments, params);
        else if (nested_type.isDateTime())
            return std::make_shared<AggregateFunctionWindowFunnel<DataTypeDateTime::FieldType, Data<DataTypeDateTime::FieldType>, true>>(
                arguments, params);
    }

    throw Exception(ErrorCodes::ILLEGAL_TYPE_OF_ARGUMENT,
                    "Illegal type {} of first argument of aggregate function {}, must "
                    "be Unsigned Number, Date, DateTime or Array with above nested types", arguments.front().get()->getName(), name);
}
```