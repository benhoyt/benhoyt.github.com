---
layout: default
title: "How to make a hash table (in C)"
permalink: /writings/how-to-make-a-hash-table/
description: "An explanation of how to make a simple hash table data structure, with code examples in the C programming language."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">March 2021</p>

<!--
TODO:
- shrink horizontal spacing on tables?
- point to Go benhoyt/counter? avoids memory allocation boilerplate
- benchmarks for linear vs binary search vs hash?
- update code snippets from samples/
-->

> Summary: An explanation of how to make a simple hash table data structure, with code examples in the C programming language. My goal is to show that hash tables are awesome, and (simple ones) are simple to build.

Recently I [compared](/writings/count-words/) a simple program that counts word frequencies across various languages, and one of the things that came up was how C doesn't have a hash table data structure in its standard library.

There are many things you can do when you realize this: use linear search, use binary search, grab someone else's hash table implementation, or write your own hash table. We're going to take a quick look at linear and binary search, and then learn how to write our own hash table.


## Linear search

The simplest option is to use [linear search](https://en.wikipedia.org/wiki/Linear_search) to scan through an array. This is actually not a bad strategy if you've only got a few items (less than about 30 (TODO)), and it allows you to append to the end of the array. With this approach you're searching an average of N/2 items.

Let's say you're searching for the key `bob` in the following array (each item is a key string with an associated integer value):

| --------- | ----- | ----- | ------ | ------ | ----- | ------ | --- |
| **Index** | 0     |     1 |      2 |      3 |     4 |      5 |   6 |
| **Key**   | `foo` | `bar` | `bazz` | `buzz` | `bob` | `jane` | `x` |
| **Value** | 10    | 42    | 36     | 7      | 11    | 100    | 200 |

You simply start at the beginning (`foo`) and compare each key. If they key matches what you're looking for, you've found it. If not, you move to the next slot. Searching for `bob` takes five steps (indexes 0 through 4) and then you're done.

Here is the algorithm in C (assuming each array item is a string key and integer value):

```c
typedef struct {
    char* key;
    int value;
} item;

item* linear_search(item* items, size_t size, const char* key) {
    for (size_t i=0; i<size; i++) {
        if (strcmp(items[i].key, key) == 0) {
            return &items[i];
        }
    }
    return NULL;
}

int main(void) {
    item items[] = {
        {"foo", 10}, {"bar", 42}, {"bazz", 36}, {"buzz", 7},
        {"bob", 11}, {"jane", 100}, {"x", 200}};
    size_t num_items = sizeof(items) / sizeof(item);

    item* found = linear_search(items, num_items, "bob");
    if (!found) {
        return 1;
    }
    printf("linear_search: value of 'bob' is %d\n", found->value);
    return 0;
}
```


## Binary search

Also quite simple is to put the items in an array which is sorted by key, and use [binary search](https://en.wikipedia.org/wiki/Binary_search_algorithm) to reduce the number of comparisons. This is kind of how we might look something up in a (paper!) dictionary.

C even has a `bsearch` function in its standard library, and this technique is fast up to about 1000 items (TODO), but it doesn't allow you to insert items without copying the rest down. With this approach you're searching an average of log(N) items.

This time the array must be pre-sorted. Assume we're looking up `bob` again:

| --------- | ----- | ------ | ----- | ------ | ----- | ------ | --- |
| **Index** |     0 |      1 |     2 |      3 |     4 |      5 |   6 |
| **Key**   | `bar` | `bazz` | `bob` | `buzz` | `foo` | `jane` | `x` |
| **Value** | 42    | 36     | 11    | 7      | 10    | 100    | 200 |

With binary search, we start in the middle (`buzz`), and if the key there is greater than what we're looking for, we repeat the process with the lower half, if it's greater, we repeat the process with the higher half. In this case it results in three steps, at indexes 3, 1, 2, and then we have it.

Here's how you'd do it in C (with and without `bsearch`):

```c
int cmp(const void* a, const void* b) {
    item* item_a = (item*)a;
    item* item_b = (item*)b;
    return strcmp(item_a->key, item_b->key);
}

item* binary_search(item* items, size_t size, const char* key) {
    size_t low = 0;
    size_t high = size;

    while (low < high) {
        size_t mid = (low+high) / 2;
        int c = strcmp(items[mid].key, key);
        if (c == 0) {
            return &items[mid];
        }
        if (c < 0) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }
    if (low < size && strcmp(items[low].key, key) == 0) {
        return &items[low];
    }
    return NULL;
}

int main(void) {
    item items[] = {
        {"bar", 42}, {"bazz", 36}, {"bob", 11}, {"buzz", 7},
        {"foo", 10}, {"jane", 100}, {"x", 200}};
    size_t num_items = sizeof(items) / sizeof(item);

    item key = {"bob", 0};
    item* found = bsearch(&key, items, num_items, sizeof(item), cmp);
    if (!found) {
        return 1;
    }
    printf("bsearch: value of 'bob' is %d\n", found->value);

    found = binary_search(items, num_items, "bob");
    if (!found) {
        return 1;
    }
    printf("binary_search: value of 'bob' is %d\n", found->value);
    return 0;
}
```


## Hash tables (with linear probing)

[Hash tables](https://en.wikipedia.org/wiki/Hash_table) can seem quite scary: there are a lot of different types, and a ton of different optimizations you can do. However, if you use a simple hash function with what's called "linear probing" you can create a decent hash table quite easily.

If you don't know how a hash table works, here's a quick refresher. A hash tables is a container data structure that allows you to quickly look up a key (usually a string) to find its corresponding value (any data type). Under the hood, they're arrays that are indexed by a hash function of the key.

A hash function turns a key into a random-looking number, and it must always return the same number for the same key. For example, with the hash function we're going to use (64-bit [FNV-1](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function#FNV-1_hash)), the hashes of the keys above are as follows:

<!-- TODO: calculate hashes: https://play.golang.org/p/bik3FSiGVJJ -->

| Key | Hash | Hash modulo 16 |
| --- | ---- | ----------- |
| `bar` | 15625701906442958976 | 0 |
| `bazz` | 2813642004701319010 | 2 |
| `bob` | 15625704105466215482 | 10 |
| `buzz` | 2825191274841776574 | 14 |
| `foo` | 15621798640163566899 | 3 |
| `jane` | 16328289176863632041 | 9 |
| `x` | 12638153115695167399 | 7 |

The reason I've shown the hash modulo 16 is because we're going to start with an array of 16 elements, so we need to limit the hash to the number of elements in the array -- the [modulo](https://en.wikipedia.org/wiki/Modulo_operation) operation divides by 16 and gives the remainder, limiting the hash to the range 0 through 15.

When we insert a value into the hash table, we calculate its hash, modulo by 16, and use that as the array index. So with an array of size 16, we'd insert `bar` at index 0, `bazz` at 2, `bob` at 10, and so on. Let's see what our hash table array looks like once those keys and values have been added:

| - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| **Index** | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
| **Key**   | `bar` | `.` | `bazz` | `foo` | `.` | `.` | `.` | `x` | `.` | `jane` | `bob` | `.` | `.` | `.` | `buzz` | `.` |
| **Value** | 42    | `.` | 36     | 10    | `.` | `.` | `.` | 200 | `.` | 100    | 11    | `.` | `.` | `.` | 7      | `.` |

To look up a value, we simply fetch `array[hash(key) % 16]`.

But what if two keys hash to the same value (after the modulo 16)? Depending on the size of the array, this is fairly common. For example, if we try to add `bill` to the array above, its hash modulo 16 is 14. But we already have `buzz` at index 14, so we get a *collision*.

There are various ways of handling collisions. Traditionally you'd create a hash array of a certain size, and if there was a collision, you'd use a [linked list](https://en.wikipedia.org/wiki/Linked_list) to store the values that hashed to the same index. However, linked lists normally require an extra memory allocation when you add an item, and traversing them means following pointers around your memory, which is [relatively slow](https://baptiste-wicht.com/posts/2012/11/cpp-benchmark-vector-vs-list.html) on modern CPUs.

A simpler and faster way of dealing with collisions is *linear probing*: if we're trying to insert an item but there's one already there, simply move to the next slot, wrapping around to the beginning if you hit the end. If the next slot is full too, move along again, until you find an empty one. (There are [other ways](https://en.wikipedia.org/wiki/Open_addressing) of probing than just moving to the next slot, but that's beyond the scope of this article.) This technique is a lot faster than linked lists, because your CPU's cache has probably fetched the next items already.

Here's what the hash table array looks like after adding "collision" `bill` (with value 25). We try index 14 first, but that's holding `buzz`, so we move to index 15, and that's empty, so we insert it there:

| - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| **Index** | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | **15** |
| **Key**   | `bar` | `.` | `bazz` | `foo` | `.` | `.` | `.` | `x` | `.` | `jane` | `bob` | `.` | `.` | `.` | `buzz` | **`bill`** |
| **Value** | 42    | `.` | 36     | 10    | `.` | `.` | `.` | 200 | `.` | 100    | 11    | `.` | `.` | `.` | 7      | **25**     |

When the hash table gets too full, we need to allocate a larger array and move the items over. This is absolutely required when the number of items in the hash table has reached the size of the array, but usually you want to do it when the table is half full, or 75% full. If you don't resize it early enough, collisions will become more and more common, and lookups and inserts will get slower and slower. If you wait till it's almost full, you're essentially back to linear search.

This kind of hash table requires an average of one operation per lookup, plus the time to hash the key (but often the keys are relatively short string).

And that's it! There's a huge amount more you can do here, and this just scratches the surface. I'm not going to go into a scientific analysis of [big O notation](https://en.wikipedia.org/wiki/Big_O_notation), optimal array sizes, different kinds of probing, and so on. Buy Donald Knuth's [TAOCP](https://www-cs-faculty.stanford.edu/~knuth/taocp.html) if you want that level of detail!


## Hash table implementation

TODO: potential optimizations: store some of key in array, don't multiply size by 2 (1.25 or 1.5)

TODO: look at number of collisions
