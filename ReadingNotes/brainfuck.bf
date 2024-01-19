>[language compilers][https://github.com/pablojorge/brainfuck]

>[rules][https://www.deusinmachina.net/p/weird-ones-30-years-of-brainfuck]

image it operate a `short[]` and a hidden index, and this array has 8 rules:

1. `+` Increment the value of the current indexed cell by 1
2. `-` Decrement the value of the current indexed cell by 1
3. `>` Move the pointer to the next index
4. `<` Move the pointer to the previous index
5. `.` Output the Binary (to Ascii or any format) to the value of the current indexed cell
6. `,` Input a character and store its Binary value in the current indexed cell
7. `[` If the value of the current cell is zero, jump to the corresponding `]` code
8. `]` if the value of the current cell is non-zero, jump back to the corresponding `[` code

>[hello world]

+++++ +++++             initialize counter (cell #0) to 10
[                       use loop to set the next four cells to 70/100/30/10
    > +++++ ++              add  7 to cell #1
    > +++++ +++++           add 10 to cell #2 
    > +++                   add  3 to cell #3
    > +                     add  1 to cell #4
    <<<< -                  decrement counter (cell #0)
]                   
> ++ .                  print 'H'
> + .                   print 'e'
+++++ ++ .              print 'l'
.                       print 'l'
+++ .                   print 'o'
> ++ .                  print ' '
<< +++++ +++++ +++++ .  print 'W'
> .                     print 'o'
+++ .                   print 'r'
----- - .               print 'l'
----- --- .             print 'd'
> + .                   print '!'
> .                     print '\n'
