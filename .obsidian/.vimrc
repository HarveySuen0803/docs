set clipboard=unnamed
set tabstop=4

nunmap ;
nunmap s
vunmap s
nunmap x
vunmap x
vunmap ,
vunmap .

nmap <PageDown> 20j
nmap <PageUp> 20k
vmap <PageDown> 20j
vmap <PageUp> 20k

nmap <C-e> $
nmap <C-a> ^
vmap <C-e> $h
vmap <C-a> ^

nmap U <C-r>

nmap j gj
nmap k gk

exmap explorer obcommand file-explorer:reveal-active-file
nmap se :explorer

exmap outline obcommand outline:open
nmap ss :outline

exmap back obcommand app:go-back
exmap forward obcommand app:go-forward
nmap gh :back
nmap gl :forward

exmap togglefold obcommand editor:toggle-fold
nmap zo :togglefold
nmap zc :togglefold

" exmap nextHeading jsfile .obsidian.markdown-helper.js {jumpHeading(true)}
" exmap prevHeading jsfile .obsidian.markdown-helper.js {jumpHeading(false)}
" nmap g] :nextHeading
" nmap g[ :prevHeading

nmap ya ggv.Gy

nmap < v<<Esc>
nmap > v><Esc>

vmap , <C-v>
vmap . V

nmap x "_d
nmap xx "_dd
nmap X "_D
vmap x "_d
vmap X "_D

