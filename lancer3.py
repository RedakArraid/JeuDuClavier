from tkinter import*
from time import*
from random import*
class Lancer(object):
    def __init__(self,boss=None,niveau=[1,30,"Facile"],mp="",qt="",md=1):
        if qt=="":
            self.q=self.quitter
        else:
            self.q=qt
        self.can_fond1=Canvas(boss,bg="light gray",width=500,height=650)
        self.can_fond1.grid(row=0)
        self.niv=Label(self.can_fond1,text=niveau[2],bg="white",font="Algerian 20",fg="red",width=30).place(x=0,y=-4)
        self.ecx,self.ecy=120,35
        self.j=Label(self.can_fond1,text="Joueur :  "+"joueur",bg="white",font="Algerian 21",fg="red",width=25)
        self.j.place(x=self.ecx,y=2+25)
        self.h=Label(self.can_fond1,text="Heure: "+asctime()[11:19],bg="white",font="Algerian 21",fg="red",width=25)
        self.h.place(x=self.ecx,y=self.ecy+2+25)
        self.sc=0
        self.niv,self.niveau_init=niveau,niveau.copy()
        self.s=Label(self.can_fond1,text="Score :"+str(self.sc),bg="white",font="Algerian 21",fg="red",width=25)
        self.s.place(x=self.ecx,y=self.ecy*2+2+25)
        self.b_pause=Button(self.can_fond1,text="Pause",font="Algerian 15",bg="turquoise",command=self.pause,width=15,relief=GROOVE)
        self.b_pause.place(x=0,y=0+25)
        self.recommencer=Button(self.can_fond1,text="Menu Principale",font="Algerian 15",bg="turquoise",command=mp,width=15,relief=GROOVE)
        self.recommencer.place(x=0,y=self.ecy+25)
        self.menu_principal=Button(self.can_fond1,text="Quitter",font="Algerian 15",bg="turquoise",command=self.q,width=15,relief=GROOVE)
        self.menu_principal.place(x=0,y=self.ecy*2+25)
        self.deb,self.text=180,"test"
        self.cc,self.fin,self.stop,self.mode=self.deb,670,False,md
        self.text_mobile=self.can_fond1.create_text(500/2,self.deb,text=self.text,fill="blue",font="Algerian 20")
        if self.mode==1:
            self.can_fond1.master.bind("<Key>",self.mdt0)
        else:
            self.can_fond1.master.bind("<Key>",self.mdt1)
        self.heure()
        self.descente()
        self.tab=['bonjour', 'merci', 'fort', 'grand', 'mignon', 'philosophie', 'marque', 'cours', 'chaque', 'doit', 'savoir', 'ecrire', 'dans', 'plan','dans', 'selon', 'cram', 'newman', 'fischer', 'nommer', 'ions', 'selon', 'principes', 'iupac',  'carbone', 'bases', 'liaison', 'chimique', 'structurale', 'optique', 'effets', 'effets', 'induits', 'effets', 'formes', 'limites', 'principales', 'fonctions', 'chimie', 'organique', 'hydrocarbures', 'alcanes', 'alcynes', 'connaitre', 'chimiques', 'notamment', 'chimiques', 'principaux', 'radicalaire', 'substitution', 'radicalaire']
    def descente(self):
        if self.stop==False and self.cc<self.fin:
            self.can_fond1.itemconfigure(self.text_mobile,text=self.text)
            self.can_fond1.coords(self.text_mobile,500/2,self.cc)
            self.cc+=self.niv[0]
            if len(self.text)!=0:
                self.can_fond1.master.after(self.niv[1],self.descente)
        elif self.cc>=self.fin:
            self.info=self.can_fond1.create_text(500/2+10,670/2,text="Vous avez perdu !!!"+"\n"+"soyez plus rapide prochainement",fill="red",font="Algerian 20")
            self.sc=0
            self.b_pause.config(text="Recommencer",command=self.play)
        elif self.stop==True:
            self.can_fond1.itemconfigure(self.text_mobile,text="")
            self.info=self.can_fond1.create_text(500/2,670/2+20,text="Pause",fill="red",font="Algerian 20")
    def mdt0(self,lettre=""):
        if lettre.char==self.text[0] and self.cc<self.fin:
            self.text=self.text[1:]
            if len(self.text)==0:
                self.text=self.tab[randint(0,len(self.tab)-1)]
                self.cc=self.deb
                self.sc+=1
                self.s.configure(text="Score :"+str(self.sc))
                if self.sc//10==self.niv[0]:
                    self.niv[0]=self.niv[0]+1
    def mdt1(self,lettre=""):
        if lettre.char==self.text[len(self.text)-1] and self.cc<self.fin:
            self.text=self.text[:len(self.text)-1]
            if len(self.text)==0:
                self.text=self.tab[randint(0,len(self.tab)-1)]
                self.cc=self.deb
                self.sc+=1
                self.s.configure(text="Score :"+str(self.sc))
                if self.sc//15==self.niv[0]:
                    self.niv[0]=self.niv[0]+1
    def pause(self):
        self.b_pause.config(text="Play",command=self.play)
        self.stop=True
    def play(self):
        if self.cc>=self.fin:
            self.cc=self.deb
            self.text=self.tab[randint(0,len(self.tab)-1)]
            self.niv=self.niveau_init.copy()
            self.s.configure(text="Score :"+str(self.sc))
        self.b_pause.config(text="Pause",command=self.pause)
        self.stop=False
        self.can_fond1.delete(self.info)
        self.descente()
    def heure(self):
        try:
            self.h.configure(text="Heure: "+asctime()[11:19])
            self.h.master.master.after(1000,self.heure)
        except:
            ""
    def quitter(self):
        self.pause()
        rep = askyesno("QUITTER LE JEU","VOULEZ-VOUS QUITTER ?")
        if rep:
            self.can_fond1.master.destroy()
        else:
            self.play()
    def mp(self):
        self.pause()
        rep = askyesno("QUITTER LE JEU","VOULEZ-VOUS ALLER AU MENU PRINCIPALE ?")
        if rep:
            self.can_fond1.master.destroy()
        else:
            self.play()
    def dell(self):
        self.can_fond1.destroy()
if __name__=="__main__":
    from tkinter import*
    from time import*
    from random import*
    from tkinter.messagebox import askyesno
    fen=Tk()
    Lancer(fen,niveau=[1,2,"Facile"])
    fen.mainloop()
