### 提供数据自动化导入的接口描述, 所有提交以json方式组织数据格式

* 功能：获取预设数据的来源、分类、子分类信息。
* 请求方式：GET
* 请求URL：/api/v1/data/import
* 请求参数：无
* 响应结果：

```python
{
    "data": {
        # 抽帧信息的下拉框选项值
        # 为方便后续动态扩充，该值由后端提供，如果前端硬编码设置填写，参考/api/v1/data/import POST 接口说明
        "extract_info":
        [
            # ["选中后的真实值，该值要回传", "页面显示值，用于用户识别"]， 比如["fix-time-interval"， "固定抽帧间隔(1张/x帧)"]
            [$realValue, $showValue],
        ],

        # 人脸检测模型下拉菜单选项，如果前端硬编码设置填写，参考/api/v1/data/import POST 接口说明
        "facedetect":
        [
            # ["选中后的真实值，该值要回传", "页面显示值，用于用户识别"]， 比如["algorithm-ssd"， "SSD"]
            [$realValue, $showValue],
        ]
    }
}
```

### /src_stat/query

* Method: GET
* 用于“数据来源”下拉菜单联动。

查询`source`、`subsource`统计信息的接口。

Demo: `/api/v1/src_stat/query?source=fudu`

可用参数：

* source: 根据source查询；
* subsource: 根据subsource查询；

返回结果：

```json
{
  "data": [
    {
        "source": "luyi",
        "count": 8916,
    },
    {
        "source": "self_collecting",
        "subsource": "baoxiaomi",
        "count": 866,
    },
  ],
  "exec_time": "0.012s",        // 查询耗时
  "total_num": 2                // 查询得到的数量
}
```

### /cat_stat/query

* Method: GET
* 用于“数据分类”下拉菜单联动。

查询`category`、`subcategory`、`input_tag`统计信息的接口。

Demo: `/api/v1/cat_stat/query`

可用参数：

* category: 根据category查询；
* subcategory: 根据subcategory查询；
* input_tag: 根据input_tag查询；

返回结果：

```json
{
  "data": [
    {
        "category": "object",
        "subcategory": "coffee_LED",
        "count": 2075,
    },
    {
        "category": "object",
        "subcategory": "fruit",
        "input_tag": "apple_negative_sample",
        "count": 1581,
    },
  ],
  "exec_time": "0.012s",        // 查询耗时
  "total_num": 2                // 查询得到的数量
}
```

***

* 功能：提交异步导入任务, 后端以填入的path为唯一条件判断是否已经导入，如果已经导入则返回非正确码(10000为正确响应码)
* 请求方式：POST
* 请求URL：/api/v1/data/import
* 请求参数：json

```python
{
    "title": $title,  # 任务的名称
    "account": $account, # nfs数据拉取的账号名称,
    "data_path": $data_path,  # 数据拉取的相对的路径
    "source": $source, # 该批次导入的数据来源
    "subsource": $subsource, # 该批次导入的数据来源
    "category": $category, # 该批次导入的数据分类
    "subcategory": $subcategory, # 该批次导入的数据子分类
    "input_tag": $input_tag, # 该批次导入的数据标签
    "desc": $desc,  # 该次导入的描述
    "mail_to": $send_to,  # list， 任务成功后，将状态信息发送给谁
    "cc_to":  $sned_to,  # list, 任务成功后，抄送状态信息给谁， 可选

    # 抽帧信息, 如果未选择，该字典值为空字典{}
    "extract": {
        "method": $method, # str,固定帧数 对应值为 'fix-frame-interval', 固定抽几张 对应值为 'fix-picture-number', 固定抽帧间隔 对应值为 'fix-time-interval'
        "value": $value, # int，大于0整数，毫秒
    },

    # 人脸检测过滤，如果未选择，该字典值为空字典{}
    "filter": {
        "algorithm": $algorithm,  # str，抽帧算法，SSD算法对应值为"algorithm-ssd"，
        "confidence": $confidenc, # float，小于1大于0，检测出置信度小于该值，则不入库直接丢弃, 未选择该项过滤置为 0
        "size": [$width, $heigth] # list，检测到人脸的宽度或者高度小于对应值，则丢弃, 未选择该项过滤置为 []
        "crop_face" : $crop_face, # bool, 是否同时导入人脸抠图数据, 默认值false
    }
}
```

* 响应结果：
```
{
    "message": $message,  //用户提示信息
}
```

### 数据导入任务列表

* 功能：获取导入任务的列表
* 请求方式：GET
* 请求URL：/api/v1/data/import/tasks
* 请求参数：无
* 响应结果：
* 
```
    {
        data: [
                {
                    "title": $title,  // str, 导入任务的标题
                    "source": $source, //str, 数据来源
                    "subsource": $subsource, //str, 数据来源
                    "category": $category, //str,数据分类
                    "subcategory": $subcategory, //str, 数据子分类
                    "inputtag": $inputtag, //str,
                    "process": $process, // int, 任务进度占比， 0<= process <= 100
                }
            }
        ],
        "message": $message,
    }
```

### 导出ZIP包功能

* 功能：数据平台接口，用于将指定数据平台的数据，以zip包形式导出，并存放于指定的地方,该数据一般是标注好的数据，用于训练使用
* 请求方式：POST
* 请求URL：/api/v1/export/to-zip
* 请求参数：

参数|类型|描述
-------|-------|-------
path |String|zip 包导出的路径
number |int|导入数据的条数，建议做个限制，不要一次超过2w条
queryUrl|String|从页面查询出数据的查询url
fileName|String|导出zip的名称

* 响应结果：

```json
{
    "message": "",  // 操作结果的状态，该状态仅用于调试
    "code": $code,  // 接口操作状态， 10000代表成功，其他数字代表失败，且含义具体待定。
    "data": {
        // 该方案，仅临时用作查看任务状态，后续可能提供更好的方案
        "statusQueryUrl": $statusQueryUrl, // 该次状态查询的url,可通过该地址查看任务的执行状态
    }
}
```

### 导出HDF5功能

* 功能：数据平台接口，用于将指定数据平台的数据，以HDF5文件格式导出，并存放于指定的地方, 该数据一般是标注好的数据，用于训练使用
* 请求方式：POST
* 请求URL：/api/v1/export/to-hdf5
* 请求参数：

参数|类型|描述
-------|-------|-------
taskId |Integer|标注任务的id值
queryUrls|List|查询出数据的查询url列表
path |String|HDF5 包导出的路径
labels | List| 标签类型列表
number |int|导入数据的条数(大于0）
testRatio |浮点数|测试数据占比(大于0小于1）

* 响应结果：

```json
{
    "message": "",  // 操作结果的状态，该状态仅用于调试
    "code": $code,  // 接口操作状态， 10000代表成功，其他数字代表失败，且含义具体待定。
    "data": {
        // 该方案，仅临时用作查看任务状态，后续可能提供更好的方案
        "statusQueryUrl": $statusQueryUrl, // 该次状态查询的url,可通过该地址查看任务的执行状态
    }
}
```

## 域账户登录接口

### 1、登录

  * 请求方式：POST
  * 请求URL：/api/v1/user/auth
  * 请求参数：json
      ```
      {
        "username": $username,  # str，域账户用户名(邮箱前缀)
        "password": $password  # str，域账户密码（域登录密码）
      }
      ```
  * Json返回值：
      ```json
      {
        "message": $message,  # str, 调试message
        "code": $code,  # 标准的http code，用于代表数据校验异常，数据校验失败时，header中的http code仍然是200
        "data": {
            "username": $username, # str，当前登录的用户名
        }
      }
      ```

### 2、退出

* 请求方式：DELETE
* 请求URL：/api/v1/user/auth
* 请求参数：无
    ```
        携带登录时header中的X-CSRFToken字段，以及cookie中的csrftoken和sessionid
    ```

* 返回值：
    ```json
    {
        "message": $message,  # str, 调试message
        "code": $code,  # 标准的http code，用于代表数据校验异常，数据校验失败时，header中的http code仍然是200
        "data": {
            "username": $username, # str，当前登录的用户名
        }
    }
    ```

## 标注任务接口

### 1、获取标注任务

> 后端每次返回固定数量的标注任务任务，后端将按任务创建的时间进行逆序返回，暂时由前端进行分页

* 请求方式：GET
* 请求URL：/api/v1/label/task
* 请求参数：无
* 返回值：
    ```json
    {
        "message": $message,  # str, 调试message
        "code": $code,  # 标准的http code，用于代表数据校验异常，数据校验失败时，header中的http code仍然是200
        "data": [
            {
                "task": "taskId",  # int, 任务id
                "name": "taskName",  # str, 任务名称
                "type": "taskType", # int, 任务类型
                "source": "source", # str, 数据来源
                "status": "ok",  # str, 数据状态
                "tag": "tag", # str, 数据tag
                "mark_type": "mark_type", # list, 标注类型
                "export_num": 10, # int, 数据平台导出总计数
                "pull_num": 10, # int ,  # 即页面上的从标注平台回传的数量
                "total_num": 10, # int, 标注平台接收到的数量
                "abandoned_num":10, # int, 标注平台标记的invalid的数量
                "labeled_num": 10, # int, 标注平台标记的invalid的数量
                "description": "description", # str, 描述信息
            }
        ]
    }
    ```

### 2、更新标注任务

> 以json方式提交数据，仅允许更新tag、description、status字段，status仅允许修改值为"test"、"drop", 其他值非法。

* 请求方式：PUT
* 请求URL：/api/v1/label/task
* 请求参数：
    ```json
    {
        "task": 1,          // int, 任务id
        "tag": "tag",       // str 数据tag
        "status": "test"/"drop",   // str 数据状态
        "description": "xxx...",   // str,描述信息
    }
    ```
* 返回数据：
    ```json
    {
        "message": $message,    // str, 调试message
        "code": $code,          // 标准的http code，用于代表数据校验异常，数据校验失败时，header中的http code仍然是200
        "data": {
        }
    }
    ```

## Dashboard接口, 默认以万为计数单位，比如返回100， 代表100万

### 1、标注数据统计接口
 * 请求方式：GET
 * 请求地址：/api/v1/dashboard/data/total
 * 请求参数：无
 * 返回数据: 返回数据总量、已标注数据量、未标注数据量
    ```json
    {
        "message": $message,    // str, 调试message
        "code": $code,          // 标准的http code，用于代表数据校验异常，数据校验失败时，header中的http code仍然是200
        "data": {
            "total": $total,  //float 图片数据总量
            "labeled": $labeled, //float 已标注数据总量
            "unlabeled": $unlabeled, //float未标注图片总量
        }
    }
    ```

### 2、图片数据总量趋势数据,默认以当前时间往回推算
 * 请求方式：GET
 * 请求地址：/api/v1/dashboard/data/trend?range=$range
 * 请求参数：range
    ```json
    GET 参数range，取值范围(week, month), 没有参数时，默认返回以week为时间段的数据
    ```
 * 返回数据: 返回数据总量趋势， range字段与count字段对应的数组长度一致,且一一对应
    ```json
    {
        "message": $message,    // str, 调试message
        "code": $code,          // 标准的http code，用于代表数据校验异常，数据校验失败时，header中的http code仍然是200
        "data": 
        {
            "range": [
               $range, //str, 每个数据点对应的时间节点，前端可用于显示横坐标值
            ], 
            "count": [
               $count, //float, 每个时间节点对应的数据量的统计值，
            ]
        }
    }
    ```

### 3、各个数据类型的数据汇总
 * 请求方式：GET
 * 请求地址：/api/v1/dashboard/data/category
 * 请求参数：无
 * 返回数据：category字段，count字段长度一致,且一一对应
    ```json
    {
        "message": $message,    // str, 调试message
        "code": $code,          // 标准的http code，用于代表数据校验异常，数据校验失败时，header中的http code仍然是200
        "data": 
        {
            "category": [
                $category,  //str，图片的分类，如face、body、object等
            ]
            "count": [
                $count, //float, 各个数据分类的统计值
            ]
        }
    }
    ```

### 4、某个数据类型下各个属性所含图片量的汇总
 * 请求方式：GET
 * 请求地址：/api/v1/dashboard/data/subcategory?category=$category
 * 请求参数：category, 可选
    ```json
        category, 可选, 字段取值范围由后端返回，参考接口/api/v1/dashboard/data/category 
    ```
 * 返回数据：subcategory字段，count字段长度一致,且一一对应
    ```json
    {
        "message": $message,    // str, 调试message
        "code": $code,          // 标准的http code，用于代表数据校验异常，数据校验失败时，header中的http code仍然是200
        "data": 
        {
            "current_category": $scategory, // 当前接口返回的标注数据分类
            "category": [  // 数据分类列表
                $category,  //str，数据分类，如face、body、object等
            ],      
            "subcategory": [ // 数据子分类子分类列表
                $subcategory,  //str，数据子分类，如facedet、emotion、face_attr等
            ]
            "count": [
                $count, //float, 各个数据类型的统计值
            ]
        }
    }
    ```
 