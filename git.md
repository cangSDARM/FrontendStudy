## git

需要安装

- [filter-repo](https://htmlpreview.github.io/?https://github.com/newren/git-filter-repo/blob/docs/html/git-filter-repo.html)
- [git-lfs](https://git-lfs.com/)

```bash
python -m pip install --user git-filter-repo
# and add 'python/Scripts' to $PATH
```

替换用户/email

```bash
git filter-repo --name-callback 'return name.replace(b\"xxxx\", b\"yyy\")' --force
# --email-callback eta
```

删除文件历史记录

```bash
git filter-repo --invert-paths --path <FILE_PATH> --force
```

删除本地提交记录，强制同步远程

```bash
git reset --hard origin/branchName
```

大文件处理

```bash
git lfs track "*.7z"
```

proxy

```bash
# http
git -c "http.proxy=socks5://127.0.0.1:1080" clone https://github.com/xx/yy.git

# ssh need a config
ProxyCommand connect -S 127.0.0.1:1080 %h %p
```
