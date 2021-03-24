---
layout: default
title: "How to implement a hash table (in C)"
permalink: /writings/hash-table-in-c/
description: "An explanation of how to implement a simple hash table data structure, with code examples in the C programming language."
---
<h1>{{ page.title }}</h1>
<p class="subtitle">March 2021</p>

<!--
TODO:
- if I got help from codereview, link to:
  https://codereview.stackexchange.com/questions/257634/hash-table-implemented-in-c-with-open-addressing
- ensure code snippets are up to date
-->

<style>
th, td { padding-right: 0.9em; }
</style>

> Summary: An explanation of how to implement a simple hash table data structure using the C programming language. I briefly demonstrate linear and binary search, and then design and implement a hash table. My goal is to show that hash table internals are not scary, but -- within certain constraints -- are simple to build from scratch.
>
> **Go to:** [Linear search](#linear-search) \| [Binary search](#binary-search) \| [Hash tables](#hash-tables) \| [Implementation](#hash-table-implementation) \| [Discussion](#discussion)


Recently I wrote an [article that compared](/writings/count-words/) a simple program that counts word frequencies across various languages, and one of the things that came up was how C doesn't have a hash table data structure in its standard library.

There are many things you can do when you realize this: use linear search, use binary search, grab someone else's hash table implementation, or write your own hash table. Or switch to a richer language. We're going to take a quick look at linear and binary search, and then learn how to write our own hash table. This is often necessary in C, but it can also be useful if you need a custom hash table when using another language.


## Linear search

The simplest option is to use [linear search](https://en.wikipedia.org/wiki/Linear_search) to scan through an array. This is actually not a bad strategy if you've only got a few items -- in my [simple comparison](https://github.com/benhoyt/ht/blob/master/samples/perflbh.c) using strings, it's faster than a hash table lookup up to about 7 items (but unless your program is very performance-sensitive, it's probably fine up to 20 or 30 items). Linear search also allows you to append new items to the end of the array. With this type of search you're comparing an average of N/2 items.

Let's say you're searching for the key `bob` in the following array (each item is a string key with an associated integer value):

| --------- | ----- | ----- | ------ | ------ | ----- | ------ | --- |
| **Index** | 0     |     1 |      2 |      3 |     4 |      5 |   6 |
| **Key**   | `foo` | `bar` | `bazz` | `buzz` | `bob` | `jane` | `x` |
| **Value** | 10    | 42    | 36     | 7      | 11    | 100    | 200 |

You simply start at the beginning (`foo` at index 0) and compare each key. If the key matches what you're looking for, you're done. If not, you move to the next slot. Searching for `bob` takes five steps (indexes 0 through 4).

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

C even has a `bsearch` function in its standard library. Binary search is reasonably fast even for hundreds of items (though not as fast as a hash table), because you're only comparing an average of log(N) items. However, it doesn't allow you to insert items without copying the rest down, so insertions require N operations.

This time the array must be pre-sorted. Assume we're looking up `bob` again:

| --------- | ----- | ------ | ----- | ------ | ----- | ------ | --- |
| **Index** |     0 |      1 |     2 |      3 |     4 |      5 |   6 |
| **Key**   | `bar` | `bazz` | `bob` | `buzz` | `foo` | `jane` | `x` |
| **Value** | 42    | 36     | 11    | 7      | 10    | 100    | 200 |

With binary search, we start in the middle (`buzz`), and if the key there is greater than what we're looking for, we repeat the process with the lower half, if it's greater, we repeat the process with the higher half. In this case it results in three steps, at indexes 3, 1, 2, and then we have it.

Here's how you'd do it in C (with and without `bsearch`). The definition of the `item` struct is the same as above.

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
        size_t mid = (low + high) / 2;
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
    if (found == NULL) {
        return 1;
    }
    printf("bsearch: value of 'bob' is %d\n", found->value);

    found = binary_search(items, num_items, "bob");
    if (found == NULL) {
        return 1;
    }
    printf("binary_search: value of 'bob' is %d\n", found->value);
    return 0;
}
```


## Hash tables

[Hash tables](https://en.wikipedia.org/wiki/Hash_table) can seem quite scary: there are a lot of different types, and a ton of different optimizations you can do. However, if you use a simple hash function with what's called "linear probing" you can create a decent hash table quite easily.

If you don't know how a hash table works, here's a quick refresher. A hash tables is a container data structure that allows you to quickly look up a key (often a string) to find its corresponding value (any data type). Under the hood, they're arrays that are indexed by a hash function of the key.

A hash function turns a key into a random-looking number, and it must always return the same number given the same key. For example, with the hash function we're going to use (64-bit [FNV-1](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function#FNV-1_hash)), the hashes of the keys above are as follows:

<!-- To calculate hashes, see: https://play.golang.org/p/bik3FSiGVJJ -->

| Key    | Hash                 | Hash modulo 16 |
| ------ | -------------------- | -------------- |
| `bar`  | 15625701906442958976 | 0              |
| `bazz` | 2813642004701319010  | 2              |
| `bob`  | 15625704105466215482 | 10             |
| `buzz` | 2825191274841776574  | 14             |
| `foo`  | 15621798640163566899 | 3              |
| `jane` | 16328289176863632041 | 9              |
| `x`    | 12638153115695167399 | 7              |

The reason I've shown the hash modulo 16 is because we're going to start with an array of 16 elements, so we need to limit the hash to the number of elements in the array -- the [modulo](https://en.wikipedia.org/wiki/Modulo_operation) operation divides by 16 and gives the remainder, limiting the hash to the range 0 through 15.

When we insert a value into the hash table, we calculate its hash, modulo by 16, and use that as the array index. So with an array of size 16, we'd insert `bar` at index 0, `bazz` at 2, `bob` at 10, and so on. Let's see what our hash table array looks like once those keys and values have been added -- note that their order has been shuffled around:

| --------- | ----- | - | ------ | ----- | - | - | - | --- | - | ------ | ----- | -- | -- | -- | ------ | -- |
| **Index** | 0     | 1 | 2      | 3     | 4 | 5 | 6 | 7   | 8 | 9      | 10    | 11 | 12 | 13 | 14     | 15 |
| **Key**   | `bar` | . | `bazz` | `foo` | . | . | . | `x` | . | `jane` | `bob` | .  | .  | .  | `buzz` | .  |
| **Value** | 42    | . | 36     | 10    | . | . | . | 200 | . | 100    | 11    | .  | .  | .  | 7      | .  |

To look up a value, we simply fetch `array[hash(key) % 16]`.

But what if two keys hash to the same value (after the modulo 16)? Depending on the hash function and the size of the array, this is fairly common. For example, if we try to add `bill` to the array above, its hash modulo 16 is 14. But we already have `buzz` at index 14, so we get a *collision*.

There are various ways of handling collisions. Traditionally you'd create a hash array of a certain size, and if there was a collision, you'd use a [linked list](https://en.wikipedia.org/wiki/Linked_list) to store the values that hashed to the same index. However, linked lists normally require an extra memory allocation when you add an item, and traversing them means following pointers scattered around in memory, which is [relatively slow](https://baptiste-wicht.com/posts/2012/11/cpp-benchmark-vector-vs-list.html) on modern CPUs.

A simpler and faster way of dealing with collisions is *linear probing*: if we're trying to insert an item but there's one already there, simply move to the next slot. If the next slot is full too, move along again, until you find an empty one, wrapping around to the beginning if you hit the end of the array. (There are [other ways](https://en.wikipedia.org/wiki/Open_addressing) of probing than just moving to the next slot, but that's beyond the scope of this article.) This technique is a lot faster than linked lists, because your CPU's cache has probably fetched the next items already.

Here's what the hash table array looks like after adding "collision" `bill` (with value 25). We try index 14 first, but that's holding `buzz`, so we move to index 15, and that's empty, so we insert it there:

| --------- | ----- | - | ------ | ----- | - | - | - | --- | - | ------ | ----- | -- | -- | -- | ------ | ---------- |
| **Index** | 0     | 1 | 2      | 3     | 4 | 5 | 6 | 7   | 8 | 9      | 10    | 11 | 12 | 13 | 14     | **15**     |
| **Key**   | `bar` | . | `bazz` | `foo` | . | . | . | `x` | . | `jane` | `bob` | .  | .  | .  | `buzz` | **`bill`** |
| **Value** | 42    | . | 36     | 10    | . | . | . | 200 | . | 100    | 11    | .  | .  | .  | 7      | **25**     |

When the hash table gets too full, we need to allocate a larger array and move the items over. This is absolutely required when the number of items in the hash table has reached the size of the array, but usually you want to do it when the table is half or three-quarters full. If you don't resize it early enough, collisions will become more and more common, and lookups and inserts will get slower and slower. If you wait till it's almost full, you're essentially back to linear search.

With a good hash function, this kind of hash table requires an average of one operation per lookup, plus the time to hash the key (but often the keys are relatively short string).

And that's it! There's a huge amount more you can do here, and this just scratches the surface. I'm not going to go into a scientific analysis of [big O notation](https://en.wikipedia.org/wiki/Big_O_notation), optimal array sizes, different kinds of probing, and so on. Read Donald Knuth's [TAOCP](https://www-cs-faculty.stanford.edu/~knuth/taocp.html) if you want that level of detail!


## Hash table implementation

You can find the code for this implementation in the [benhoyt/ht](https://github.com/benhoyt/ht) repo on GitHub, in [ht.h](https://github.com/benhoyt/ht/blob/master/ht.h) and [ht.c](https://github.com/benhoyt/ht/blob/master/ht.c). For what it's worth, all the code is released under a permissive MIT license.

### API design

First let's consider what API we want: we need a way to create and destroy a hash table, get the value for a given key, set a value for a given key, get the number of items, and iterate over the items. I'm not aiming for a maximum-efficiency API, but one that fairly simple to implement.

After a couple of iterations, I settled on the following functions and structs (see [ht.h](https://github.com/benhoyt/ht/blob/master/ht.h)):

```c
// Create new hash table and return pointer to it, or NULL if out of
// memory.
ht* ht_create(void);

// Free memory allocated for hash table, including allocated keys.
void ht_destroy(ht* table);

// Get item with given key (NUL-terminated) from hash table. Return
// value (which was set with ht_set), or NULL if key not found.
void* ht_get(ht* table, const char* key);

// Set item with given key (NUL-terminated) to value (which must not
// be NULL). If not already present in table, key is copied to newly
// allocated memory (keys are freed automatically when ht_destroy is
// called). Return address of copied key, or NULL if out of memory.
const char* ht_set(ht* table, const char* key, void* value);

// Return number of items in hash table.
size_t ht_length(ht* table);

// Return new hash table iterator (for use with ht_next).
hti ht_iterator(ht* table);

// Move iterator to next item in hash table, update iterator's key
// and value to current item, and return true. If there are no more
// items, return false. Don't call ht_set during iteration.
bool ht_next(hti* it);

// Hash table entry (this is not actually part of the public API).
typedef struct {
    char* key;
    void* value;
} _ht_entry;

// Hash table structure: create with ht_create, free with ht_destroy.
typedef struct {
    // Don't use these fields directly.
    _ht_entry* _entries; // hash buckets (entry.key != NULL if populated)
    size_t _capacity;    // size of _entries array
    size_t _length;      // number of items in hash table
} ht;

// Hash table iterator: create with ht_iterator, iterate with ht_next.
typedef struct {
    char* key;      // current key
    void* value;    // current value

    // Don't use these fields directly.
    ht* _table;     // reference to hash table being iterated
    size_t _index;  // current index into ht._entries
} hti;
```

A few notes about this API design:

* For simplicity, we use C-style NUL-terminated strings. I know there are more efficient approaches to string handling, but this fits with C's standard library.
* The `ht_set` function allocates and copies the key (if inserting for the first time). Usually you don't want the caller to have to worry about this, or ensuring the key memory stays around. Note that `ht_set` returns a pointer to the duplicated key. This is mainly used as an "out of memory" error signal -- it returns NULL on failure.
* However, `ht_set` does not copy the value. It's up to the caller to ensure that the value pointer is valid for the lifetime of the hash table.
* Values can't be NULL. This makes the signature of `ht_get` slightly simpler, as you don't have to distinguish between a NULL value and one that hasn't been set at all.
* The `ht_length` function isn't strictly necessary, as you can find the length by iterating the table. However, that's a bit of a pain (and slow), so it's useful to have `ht_length`.
* There are various ways I could have done iteration. Using an explicit iterator type with a while loop seems simple and natural in C (see the example below). The value returned from `ht_iterator` is a value, not a pointer, both for efficiency and so the caller doesn't have to free anything.
* There's no `ht_remove` to remove an item from the hash table. It wouldn't be hard to write, but I don't often need to remove items when using a hash table, so for simplicity I've left it out.

### Demo program

Below is a simple program ([demo.c](https://github.com/benhoyt/ht/blob/master/samples/demo.c)) that demonstration using all the functions of the API. It counts the frequencies of unique, space-separated words from standard input, and prints the results (in an arbitrary order, because the iteration order of our hash table is undefined). It ends by printing the total number of unique words.

```c
// Example:
// $ echo 'foo bar the bar bar bar the' | ./demo
// bar 4
// foo 1
// the 2
// 3

void exit_nomem(void) {
    fprintf(stderr, "out of memory\n");
    exit(1);
}

int main(void) {
    ht* counts = ht_create();
    if (counts == NULL) {
        exit_nomem();
    }

    // Read next word from stdin (at most 100 chars long).
    char word[101];
    while (scanf("%100s", word) != EOF) {
        // Look up word.
        void* value = ht_get(counts, word);
        if (value != NULL) {
            // Already exists, increment int that value points to.
            int* pcount = (int*)value;
            (*pcount)++;
            continue;
        }

        // Word not found, allocate space for new int and set to 1.
        int* pcount = malloc(sizeof(int));
        if (pcount == NULL) {
            exit_nomem();
        }
        *pcount = 1;
        if (ht_set(counts, word, pcount) == NULL) {
            exit_nomem();
        }
    }

    // Print out words and frequencies, freeing values as we go.
    hti it = ht_iterator(counts);
    while (ht_next(&it)) {
        printf("%s %d\n", it.key, *(int*)it.value);
        free(it.value);
    }

    // Show the number of unique words.
    printf("%d\n", (int)ht_length(counts));

    ht_destroy(counts);
    return 0;
}
```

Now let's turn to the hash table implementation ([ht.c](https://github.com/benhoyt/ht/blob/master/ht.c)).

### Create and destroy

Allocating a new hash table is fairly straight-forward. We start with an initial size of 8 -- which means 16 slots in our `_entries` array (this is stored in `_capacity`). There are two allocations, one for the hash table struct itself, and one for the entries array. Note that we use `calloc` for the entries array, to ensure all the keys are NULL to start with, meaning all slots are empty.

The `ht_destroy` function frees this memory, but also frees memory from the duplicated keys that were allocated along the way (more on that below).

```c
#define INITIAL_SIZE 8

static ht* _ht_create(size_t size) {
    // Allocate space for hash table struct.
    ht* table = malloc(sizeof(ht));
    if (table == NULL) {
        return NULL;
    }
    table->_length = 0;
    table->_capacity = size * 2;

    // Allocate (zero'd) space for entry buckets.
    table->_entries = calloc(table->_capacity, sizeof(_ht_entry));
    if (table->_entries == NULL) {
        free(table); // error, free table before we return!
        return NULL;
    }
    return table;
}

ht* ht_create(void) {
    return _ht_create(INITIAL_SIZE);
}

void ht_destroy(ht* table) {
    // First free allocated keys.
    for (size_t i = 0; i < table->_capacity; i++) {
        if (table->_entries[i].key != NULL) {
            free(table->_entries[i].key);
        }
    }

    // Then free entries array and table itself.
    free(table->_entries);
    free(table);
}
```

### Hash function

Next we define our hash function, which is a straight-forward C implementation of the [FNV-1 hash algorithm](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function#FNV-1_hash). Note that FNV is not a randomized or cryptographic hash function, so it's possible for an attacker to create keys with a lot of collisions and cause lookups to slow way down -- Python [switched away](https://www.python.org/dev/peps/pep-0456/) from FNV for this reason. For our use case, however, FNV is simple and fast.

As far as the algorithm goes, FNV simply starts the hash with an "offset" constant, and for each byte in the string, multiplies the hash by a big prime number and then XORs it with the current byte. The offset and prime are carefully chosen by people with PhDs.

We're using the 64-bit variant, because, well, most computers are 64-bit these days and it seemed like a good idea. You can tell I don't have one of those PhDs. :-) Seriously, though, it seemed better than using the 32-bit version in case we have a very large hash table.

```c
#define FNV_OFFSET 14695981039346656037UL
#define FNV_PRIME 1099511628211UL

// Return 64-bit FNV-1 hash for key (NUL-terminated). See description at:
// https://en.wikipedia.org/wiki/Fowler–Noll–Vo_hash_function
static uint64_t _hash(const char* key) {
    uint64_t hash = FNV_OFFSET;
    for (const char* p = key; *p; p++) {
        hash *= FNV_PRIME;
        hash ^= (uint64_t)(*p);
    }
    return hash;
}
```

### Get

Next let's look at the `ht_get` function. First it calculates the hash, modulo the `_capacity` (the size of the entries array), which is done by ANDing with `_capacity - 1`. This is only possible because, as we'll see below, we're ensuring our array size is always a power of two, for simplicity.

Then we loop till we find an empty slot, in which case we didn't find the key. For each non-empty slot, we use `strcmp` to check whether the key at this slot is the one we're looking for (it'll be the first one unless there had been a collision). If not, we move along one slot.

```c
void* ht_get(ht* table, const char* key) {
    // AND hash with capacity-1 to ensure it's within entries array.
    uint64_t hash = _hash(key);
    size_t index = (size_t)(hash & (uint64_t)(table->_capacity - 1));

    // Loop till we find an empty entry.
    while (table->_entries[index].key != NULL) {
        if (strcmp(key, table->_entries[index].key) == 0) {
            // Found key, return value.
            return table->_entries[index].value;
        }
        // Key wasn't in this slot, move to next (linear probing).
        index++;
        if (index >= table->_capacity) {
            // At end of entries array, wrap around.
            index = 0;
        }
    }
    return NULL;
}
```

### Set

The `ht_set` function is slightly more complicated, because it has to expand the table if there are too many elements. In our implementation, we double the capacity whenever it gets to be half full. This is a little wasteful of memory, but it keeps things very simple.

First, the `ht_set` function. Apart from the call to `_ht_expand`, it's very similar in structure to `ht_get`:

```c
const char* ht_set(ht* table, const char* key, void* value) {
    assert(value != NULL);
    if (value == NULL) {
        return NULL;
    }

    // AND hash with capacity-1 to ensure it's within entries array.
    uint64_t hash = _hash(key);
    size_t index = (size_t)(hash & (uint64_t)(table->_capacity - 1));

    // If length will exceed half of current capacity, expand it.
    if (table->_length >= table->_capacity / 2) {
        if (!_ht_expand(table)) {
            return NULL;
        }
        // Recalculate index as capacity has changed.
        index = (size_t)(hash & (uint64_t)(table->_capacity - 1));
    }

    // Loop till we find an empty entry.
    while (table->_entries[index].key != NULL) {
        if (strcmp(key, table->_entries[index].key) == 0) {
            // Found key (it already exists), update value.
            table->_entries[index].value = value;
            return table->_entries[index].key;
        }
        // Key wasn't in this slot, move to next (linear probing).
        index++;
        if (index >= table->_capacity) {
            // At end of entries array, wrap around.
            index = 0;
        }
    }

    // Didn't find key, allocate/copy key and insert it.
    char* key_copy = strdup(key);
    if (key_copy == NULL) {
        return NULL;
    }
    table->_entries[index].key = key_copy;
    table->_entries[index].value = value;
    table->_length++; // be sure to update length
    return key_copy;
}
```

Note the `strdup` at the end, to allocate space for and copy the key. We also increment `_length` to record that we've inserted a new item (this allows the `ht_length` implementation to trivially return `ht->_length`).

What about the `_ht_expand` helper function? It does a bit of a trick: it uses `ht_create` to create a new hash table with twice the capacity, so that we can insert all the table's items into the new table. However, the trick is we then use the new table's `_entries` array for the existing table, but throw away the new table struct itself. This is slightly inefficient, but allows us to reuse `ht_set` to insert the keys (the second call to `ht_set` will never call `_ht_expand`, because we've just doubled the capacity). Here is the code:

```c
// Expand hash table to twice its current size. Return true on success,
// false if out of memory.
static bool _ht_expand(ht* table) {
    // Creating new table so we can use ht_set to move items into it.
    ht* new_table = _ht_create(table->_capacity);
    if (new_table == NULL) {
        return false;
    }

    // Iterate entries, move all non-empty ones to new table's entries.
    for (size_t i = 0; i < table->_capacity; i++) {
        _ht_entry entry = table->_entries[i];
        if (entry.key != NULL) {
            const char* key = ht_set(new_table, entry.key, entry.value);
            if (key == NULL) {
                ht_destroy(new_table);
                return false;
            }
        }
    }

    // Free old entries array and update this table's details.
    free(table->_entries);
    table->_entries = new_table->_entries;
    table->_capacity = new_table->_capacity;

    // Free new table structure (we've updated the existing one).
    free(new_table);
    return true;
}
```

### Length and iteration

The `ht_length` function is trivial -- we update the number of items in `_length` as we go, so just return that:

```c
size_t ht_length(ht* table) {
    return table->_length;
}
```

Iteration is the final piece. To create an iterator, a user will call `ht_iterator`, and to move to the next item, call `ht_next` in a loop while it returns `true`. Here's how they're defined:

```c
hti ht_iterator(ht* table) {
    hti it;
    it._table = table;
    it._index = 0;
    return it;
}

bool ht_next(hti* it) {
    // Loop till we've hit end of entries array.
    ht* table = it->_table;
    while (it->_index < table->_capacity) {
        size_t i = it->_index;
        it->_index++;
        if (table->_entries[i].key != NULL) {
            // Found next non-empty item, update iterator key and value.
            _ht_entry entry = table->_entries[i];
            it->key = entry.key;
            it->value = entry.value;
            return true;
        }
    }
    return false;
}
```


## Discussion

That's it -- the implementation in [ht.c](https://github.com/benhoyt/ht/blob/master/ht.c) is less than 200 lines of code, including blank lines and comments.

Beware: this is a teaching tool and not a library, so it's not very well tested. I would advise against using it without a bunch of further testing, checking edge cases, etc. Remember, this is unsafe C we're dealing with. Even while writing this I realized I'd used `malloc` instead of `calloc` to allocate the entries array, which meant the keys may not have been initialized to NULL.

As I mentioned, I wanted to keep the implementation simple, and wasn't too worried about performance. However, a quick, non-scientific performance comparison with Go's `map` implementation shows that it fares pretty well -- with half a million English words, this C version is [about the same speed for lookup](https://github.com/benhoyt/ht/blob/master/samples/perfget.c) and [40% faster for insertion](https://github.com/benhoyt/ht/blob/master/samples/perfset.c).

Speaking of Go and hash tables, it's even easier to write custom hash tables in a language like Go, because you don't have to worry about handling memory allocation errors or freeing allocated memory. I recently wrote a [counter](https://github.com/benhoyt/counter) package in Go which implements a similar kind of hash table.

I won't be doing a detailed analysis here, but I have included a little [statistics program](https://github.com/benhoyt/ht/blob/master/samples/stats.c) that prints the average probe length of the hash table created from the unique words in the input. The FNV-1 hash algorithm we're using seems to work pretty well on the list of English words (average probe length 1.4), but not so well with a lot of very similar keys (average probe length 5.0) -- I tested the latter by [generating](https://github.com/benhoyt/ht/blob/master/samples/gensimilar.py) a file with the same number of similar "words" like `word1`, `word2`, `word3`, and so on.

There's obviously a lot more you could do with the C version. You could focus on safety and reliability by doing various kinds of testing. You could focus on performance, and reduce memory allocations, use a ["bump allocator"](https://os.phil-opp.com/allocator-designs/#bump-allocator) for the duplicated keys, store short keys inside each item struct, and so on. You could improve the memory usage, and tune `_ht_expand` to not double in size every time. Or you could add features such as item removal.

After I'd finished writing this, I remembered that Bob Nystrom's excellent [*Crafting Intepreters*](https://craftinginterpreters.com/) book has a [chapter on hash tables](https://craftinginterpreters.com/hash-tables.html). He makes some similar design choices, though his chapter is significantly more in-depth than this article. If I'd remembered his book before I started, I probably wouldn't have written this one! Put another way, if you liked this, you'll definitely appreciate Bob's chapter (and book).

In any case, I hope you've found this useful or interesting. If you spot any bugs or have any feedback, please let me know!
