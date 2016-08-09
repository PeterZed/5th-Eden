# 8th-Eden
The game project

Parts of code are grouped together by file under the heading (a), where "a" is some whole number.
Edens, Cells, and Entities- and the files related to each- have headings (1), (2), and (3), respectively.

Their methods are in the format (a.b), where "a" is the whole number heading denoting if it falls under Edens, Cells, or Entities,
and "b" organizes the files according to what I found the most logical order. The way I see it, it organizes them from bottom-up,
so that the parts that are required and executed sooner do appear sooner.

For example, (1.1) is the Eden constructor method that is used to form the garden array and all the cells within that particular
instance of the Eden class. (1.2) is the method that is used to make the boundary references wraparound at the edges of the garden.  

After the groupings (a.b), there is the comment section [c] where "c" is some symbol that denotes the status of the file - i.e., any
comments I have on its progress:  
1. Asterisk: /* means that it is complete for the timebeing  
2. Exclamation mark: ! means that there is a known issue or consideration to be worked on, which is mentioned in the comment block at the top of the code.  
3. Question mark: ? means that there is an uncertainty in how I want to do something, which is mentioned in the comment block at the top of the code. It may require some research to evaluate best practice, or it could be regarding game design choices.  
4. Tilde: ~ means that the file is incomplete, perhaps left off in the middle of some piece somewhere in the code. The piece(s) of the code being worked on will be marked in a comment by them.
