#-*- Coding:Utf8 -*-
from demo_jeux1 import demo_text as demo
from lancer3 import Lancer
from tkinter.messagebox import *
from time import*
class Jeu_du_clavier(object):
    def __init__(self):
        self.fond_color="light gray"
        self.f2_tniv=["FACILE","MOYEN","DIFFICILE","PRO"]
        self.textes=["Jouer","Scores","Quitter","Aide"]
        self.pm=["demo","testez", "votre" ,"rapidite" ,"au" ,"clavier","By kader"]
        self.qtext=["QUITTER LE JEU","VOULEZ-VOUS QUITTER ?","VOULEZ-VOUS ALLER AU MENU PRINCIPALE ?"]
        self.dt=["Testez votre rapidite au clavier","Joueur","Heure","Score","Nom du joueur","Commencer","Niveaux","Retour",
                 "Meilleurs scores","Jeux du clavier"]
        self.md=1
        self.f1=Tk()
        self.f1.title(self.dt[9])
        self.jeu()
    def jeu(self):
        #creation de la fenetre
        self.taille="500x650"
        self.can_fond=Canvas(self.f1,bg=self.fond_color,width=500,height=650)
        self.can_fond.grid(row=0)
        self.f1.geometry(self.taille)
        #attributs de la fenetre
        self.f1_can=Canvas(self.can_fond,width=500,height=350,bg="orange")
        self.f1_can.place(x=0,y=0)
        Label(self.can_fond,text=self.dt[0],bg="white",font="Algerian 20",fg="red",width=30).place(x=-8,y=350)
        self.demo_text=self.dt[1] +" : Kader"+"\n"+self.dt[2]+" : 12:15"+"\n"+self.dt[3]+" : 900"
        self.f1_can.create_text(60,25,text=self.demo_text,font="Algerian 10",fill="white")
        self.tbf1=[]
        self.tb_command=[self.niveau,self.score,self.quitter,""]
        for i in range(4):
            self.tbf1.append(Button(self.can_fond,text=self.textes[i],fg="white",bg="turquoise",height=2,font="Algerian 20",command=self.tb_command[i],relief=GROOVE,width=10)) 
            self.tbf1[i].place(x=500/2-90,y=390+i*60)
        demo(self.f1_can,text=self.pm,pas=1,temps=3)
        self.f1.mainloop()
    def jouer(self,niv):
        if niv==1:
            self.niv=[1,30,self.f2_tniv[0]]
        elif niv==2:
            self.niv=[2,30,self.f2_tniv[1]]
        elif niv==3:
            self.niv=[5,30,self.f2_tniv[2]]
        else:
            self.md=2
            self.niv=[2,20,self.f2_tniv[3]]
        self.can_fond.destroy()
        self.can_fond=Canvas(self.f1,bg=self.fond_color,width=500,height=650)
        self.can_fond.grid(row=0)
        Label(self.can_fond,text=self.dt[4],bg="white",font="Algerian 20",fg="red",width=30).place(x=0,y=-4)
        Button(self.can_fond,text="Retour",font="50",relief="flat",command=lambda x=3:self.retour(x)).place(x=0,y=0)
        txt=StringVar()
        txt.set("joueur")
        self.f3_en=Entry(self.can_fond,font="Algerian 30",textvariable=txt)
        self.f3_en.place(x=15,y=200)
        Button(self.can_fond,text=self.dt[5],relief=GROOVE,bg="turquoise",command=self.commencer,font="Algerian 20").place(x=500/2-90,y=280)
    def niveau(self):
        self.can_fond.destroy()
        self.can_fond=Canvas(self.f1,bg=self.fond_color,width=500,height=650)
        self.can_fond.grid(row=0)
        Label(self.can_fond,text=self.dt[6],bg="white",font="Algerian 20",fg="red",width=30).place(x=0,y=-4)
        Button(self.can_fond,text=self.dt[7],font="50",relief="flat",command=lambda x=2:self.retour(x)).place(x=0,y=0)
        self.f2_tb=[]
        for i in range(4):
            self.f2_tb.append(Button(self.can_fond,text=self.f2_tniv[i],command=lambda x=i+1: self.jouer(x),relief=GROOVE,bg="turquoise",font="Algerian 20"))
            self.f2_tb[i].place(x=500/2-70,y=200+i*70)
    def commencer(self):
        if self.f3_en.get()!="":
            self.joueur=self.f3_en.get()
        else:
            self.joueur="joueur"
        self.can_fond.destroy()
        self.j=Lancer(self.f1,self.niv,self.mp,self.quitter2,md=self.md)
    def score(self):
        self.can_fond.destroy()
        self.can_fond=Canvas(self.f1,bg=self.fond_color,width=500,height=650)
        self.can_fond.grid(row=0)
        Label(self.can_fond,text=self.dt[8],bg="white",font="Algerian 20",fg="red",width=30).place(x=0,y=-4)
        Button(self.can_fond,text=self.dt[7],font="50",relief="flat",command=lambda x=2:self.retour(x)).place(x=0,y=0)
        for i in range(4):
            t=str(self.f2_tniv[i])+": joueur,"+self.dt[3]+" "+str(0)
            Label(self.can_fond,text=t,font="Algerian 20",width=29).place(x=5,y=170+i*50)
    def joueur():
    	""

    def retour(self,fen):
        if fen==2:
            try:
                self.can_fond.destroy()
            except:
                ""
            self.jeu()
        elif fen==3:
            try:
                self.can_fond.destroy()
            except:
                ""
            self.niveau()
        else:
            try:
                self.can_fond.destroy()
            except:
                ""
            self.commencer()
    def quitter(self):
        rep = askyesno(self.qtext[0],self.qtext[1])
        if rep:
            self.f1.destroy()
    def mp(self):
        self.j.pause()
        rep = askyesno(self.qtext[0],self.qtext[2])
        if rep:
            self.j.dell()
            self.jeu()
        else:
            self.j.play()
    def quitter2(self):
        self.j.pause()
        rep = askyesno(self.qtext[0],self.qtext[1])
        if rep:
            self.f1.destroy()
        else:
            self.j.play()
if __name__=="__main__":
    from tkinter import*
    from time import*
    Jeu_du_clavier()



