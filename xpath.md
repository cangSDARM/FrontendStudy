用于 XML 文档查找特定对象

可以随意拼接规则

1. 任意目录查找全体（无论多深都是//）<br/>
   `//book`
2. 查找子节点<br/>
   `/root/note/book`
3. 按照顺序查找<br/>
   `/root/note/book[1]`
4. 按照属性查找<br/>
   `/root/node[@preprty=xps]`
5. 查找元素属性<br/>
   `//book/@src` （book 的 src 属性）
6. 模糊查询<br/>
   `//book[contains(@id, "se_")` (id 包含 se\_的 book
7. 标签内容<br/>
   `//book.text`
