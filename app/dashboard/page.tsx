"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Settings, LogOut, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"

interface Category {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
}

interface Task {
  id: string
  title: string
  completed: boolean
  category_id: string | null
  user_id: string
  created_at: string
  updated_at?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("default")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6")
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [groupByCategory, setGroupByCategory] = useState(true)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!supabase) {
      console.error("Supabase client not available")
      return
    }
    checkUser()
  }, [supabase])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const checkUser = async () => {
    if (!supabase) {
      router.push("/auth/login")
      return
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
    } catch (error) {
      console.error("Erreur lors de la vérification de l'utilisateur:", error)
      router.push("/auth/login")
    }
  }

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      await Promise.all([loadCategories(), loadTasks()])
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Erreur lors du chargement des catégories:", error)
        return
      }

      if (!data || data.length === 0) {
        await createDefaultCategories()
      } else {
        setCategories(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    }
  }

  const createDefaultCategories = async () => {
    if (!user || !supabase) return

    const defaultCategories = [
      { name: "ÉTAT CIVIL", color: "#3B82F6", user_id: user.id },
      { name: "DOCUMENTS PERSONNELS", color: "#10B981", user_id: user.id },
      { name: "PHOTOS", color: "#F59E0B", user_id: user.id },
    ]

    try {
      const { data, error } = await supabase.from("categories").insert(defaultCategories).select()

      if (!error && data) {
        setCategories(data)
      }
    } catch (error) {
      console.error("Erreur lors de la création des catégories par défaut:", error)
    }
  }

  const loadTasks = async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setTasks(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error)
    }
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !user || !supabase) return

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: newTaskTitle,
          category_id: selectedCategoryId === "default" ? null : selectedCategoryId,
          user_id: user.id,
          completed: false,
        })
        .select()
        .single()

      if (!error && data) {
        setTasks([data, ...tasks])
        setNewTaskTitle("")
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tâche:", error)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    if (!supabase) return

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed, updated_at: new Date().toISOString() })
        .eq("id", taskId)

      if (!error) {
        setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed } : task)))
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error)
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (!error) {
        setTasks(tasks.filter((task) => task.id !== taskId))
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error)
    }
  }

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim() || !user || !supabase) return

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: newCategoryName,
          color: newCategoryColor,
          user_id: user.id,
        })
        .select()
        .single()

      if (!error && data) {
        setCategories([...categories, data])
        setNewCategoryName("")
        setNewCategoryColor("#3B82F6")
        setShowCategoryForm(false)
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId)

      if (!error) {
        setCategories(categories.filter((cat) => cat.id !== categoryId))
        setTasks(tasks.map((task) => (task.category_id === categoryId ? { ...task, category_id: null } : task)))
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error)
    }
  }

  const handleLogout = async () => {
    if (!supabase) return

    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return "Sans catégorie"
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.name || "Sans catégorie"
  }

  const getCategoryColor = (categoryId: string | null): string => {
    if (!categoryId) return "#6B7280"
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.color || "#6B7280"
  }

  const getTasksByCategory = (): { [key: string]: Task[] } => {
    const grouped: { [key: string]: Task[] } = {}

    tasks.forEach((task) => {
      const categoryKey = task.category_id || "uncategorized"
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = []
      }
      grouped[categoryKey].push(task)
    })

    return grouped
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration manquante</h1>
          <p className="text-slate-600">Les variables d'environnement Supabase ne sont pas configurées.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gestionnaire de Tâches Visa</h1>
            <p className="text-slate-600">Synchronisé sur tous vos appareils</p>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-slate-600">
                {completedTasks}/{totalTasks} tâches
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Task Form */}
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une tâche</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <Label htmlFor="taskTitle">Titre de la tâche</Label>
                <Input
                  id="taskTitle"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ex: Photocopie passeport"
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Sans catégorie</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter la tâche
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Category Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Gestion des catégories</CardTitle>
              <Button onClick={() => setShowCategoryForm(!showCategoryForm)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showCategoryForm && (
              <form onSubmit={addCategory} className="space-y-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="categoryName">Nom de la catégorie</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ex: DOCUMENTS MÉDICAUX"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryColor">Couleur</Label>
                  <Input
                    id="categoryColor"
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    <Check className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCategoryForm(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.name}
                  <button onClick={() => deleteCategory(category.id)} className="ml-1 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Liste des tâches</CardTitle>
              <Button onClick={() => setGroupByCategory(!groupByCategory)} variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                {groupByCategory ? "Vue simple" : "Par catégorie"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                Aucune tâche pour le moment. Ajoutez votre première tâche ci-dessus !
              </p>
            ) : groupByCategory ? (
              <div className="space-y-6">
                {Object.entries(getTasksByCategory()).map(([categoryKey, categoryTasks]) => {
                  const categoryId = categoryKey === "uncategorized" ? null : categoryKey
                  const categoryName = getCategoryName(categoryId)
                  const categoryColor = getCategoryColor(categoryId)
                  const completed = categoryTasks.filter((t) => t.completed).length
                  const total = categoryTasks.length

                  return (
                    <div key={categoryKey} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: categoryColor }} />
                        <h3 className="font-semibold text-slate-800">{categoryName}</h3>
                        <Badge variant="outline">
                          {completed}/{total}
                        </Badge>
                      </div>
                      <div className="space-y-2 ml-7">
                        {categoryTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={(e) => toggleTask(task.id, e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span
                              className={`flex-1 ${task.completed ? "line-through text-slate-500" : "text-slate-800"}`}
                            >
                              {task.title}
                            </span>
                            <Button
                              onClick={() => deleteTask(task.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => toggleTask(task.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className={`flex-1 ${task.completed ? "line-through text-slate-500" : "text-slate-800"}`}>
                      {task.title}
                    </span>
                    {task.category_id && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getCategoryColor(task.category_id) }}
                        />
                        {getCategoryName(task.category_id)}
                      </Badge>
                    )}
                    <Button
                      onClick={() => deleteTask(task.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
