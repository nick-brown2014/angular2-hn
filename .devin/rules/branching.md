---
trigger: always_on
description: Branch and PR targeting for angular2-hn
---

Never open a pull request into `master`. All work happens on a working branch cut from the current feature branch (`react-migration-branch`, the Angular → React migration), and every PR targets that feature branch. If no feature branch exists, create one first and point PRs at it.
