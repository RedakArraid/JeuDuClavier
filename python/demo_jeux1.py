from tkinter import*
from time import*
class demo_text(object):
    def __init__(self,can,text="Essai",debut=20,fin=500,temps=20,pas=5):
        self.can,self.t,self.db,self.f,self.temps,self.pas,self.cc,self.tab=can,text,debut,fin,temps,pas,0,[]
        self.v,self.compter=1,0
        if self.f>self.can.winfo_reqheight()-35 or self.f<self.db:
            self.f=self.can.winfo_reqheight()-35
        if self.pas>25:
            self.pas=25
        if self.istab(self.t)==True:           
            self.tab=self.t.copy()
        if len(self.tab)>0:
            for j in range(len(self.tab)):
                self.tab[j]=str(self.tab[j])
            self.text=can.create_text(((self.can.winfo_reqwidth()-4)/2)-(len(text)/2),debut,text=self.t[0],fill="blue",font="Algerian "+str((self.can.winfo_reqwidth()-4)//25))
            self.can.master.after(temps,self.defiletb)
        elif len(self.t)!=0:
            self.text=can.create_text(((self.can.winfo_reqwidth()-4)/2)-(len(text)/2),debut,text=self.t,fill="blue",font="Algerian "+str((self.can.winfo_reqwidth()-4)//25))
            self.can.master.after(temps,self.defile)
        else:
            self.t="Essai"
            print(self.t)
            self.text=can.create_text(((self.can.winfo_reqwidth()-4)/2)-(len(text)/2),debut,text=self.t,fill="blue",font="Algerian "+str((self.can.winfo_reqwidth()-4)//25))
            self.can.master.after(temps,self.defile)
    def defile(self):
        if self.cc <=self.f and (len(self.t[self.v:])+1)!=0:
            self.can.coords(self.text,((self.can.winfo_reqwidth()-4)/2)-(len(self.t)/2),self.db+self.cc)
            self.cc+=self.pas
            if self.cc//(self.f//len(self.t))>=self.v:
                self.can.itemconfigure(self.text,text=self.t[self.v:])
                self.v+=1
            elif  self.cc>=self.f:
                self.can.itemconfigure(self.text,text="") 
            self.can.master.after(self.temps,self.defile)
    def defiletb(self):
        self.t=self.tab[self.compter]
        if self.cc <=self.f and (len(self.t[self.v:])+1)!=0:
            self.can.coords(self.text,((self.can.winfo_reqwidth()-4)/2)-(len(self.t)/2),self.db+self.cc)
            self.cc+=self.pas
            if self.cc//(self.f//len(self.t))>=self.v:
                self.can.itemconfigure(self.text,text=self.t[self.v:])
                self.v+=1
            elif  self.cc>=self.f:
                self.can.itemconfigure(self.text,text="") 
            self.can.master.after(self.temps,self.defiletb)
        elif self.compter<len(self.tab)-1:
            self.cc=0
            self.compter+=1
            self.v=0
            self.can.master.after(self.temps,self.defiletb)
        
    def istab(self,tab):
        try :
            tab.join("")
            return False
        except:
            return True
        
if __name__=="__main__":
    fen=Tk()
    c=Canvas(fen,width=600,height=300,bg="green")
    c.pack()
    
    c1=Canvas(fen,width=300,height=300)
    c1.pack()
    tb=[]
    for i in range(10):
        tb.append("text"+str(i))
    demo_text(c,temps=100,text=["Y"])
    demo_text(c1,temps=100,text=["nicous"])
    fen.mainloop()
