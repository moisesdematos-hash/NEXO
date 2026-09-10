import { supabase } from '../lib/supabase';
import { tasksService } from './tasksService';
import { eventsService } from './eventsService';
import { listsService } from './listsService';
import { goalsService } from './goalsService';
import { learningService } from './learningService';
import { aiMemoryService } from './aiMemoryService';
import { pulseNexoTab } from '../utils/tabPulseHelper';
import { QueryClient } from '@tanstack/react-query';

export interface AIToolExecutionResult {
  success: boolean;
  action_type: string;
  result_message: string;
  data?: any;
}

export class AIToolExecutor {
  private queryClient: QueryClient | null = null;

  setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  async executeTool(
    actionType: string,
    args: Record<string, any>,
    conversationId?: string
  ): Promise<AIToolExecutionResult> {
    const { data: { user } } = await supabase.auth.getUser();

    let resultData: any = null;
    let message = '';
    let success = true;

    try {
      switch (actionType) {
        // --- TASKS (5 Tools) ---
        case 'create_task': {
          const task = await tasksService.createTask({
            title: args.title,
            description: args.description ?? null,
            due_date: args.due_date ?? null,
            priority: args.priority ?? 'medium',
          });
          resultData = task;
          message = `✓ Tarefa "${task.title}" criada com sucesso.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['tasks'] });
          break;
        }

        case 'update_task': {
          if (!args.task_id) throw new Error('ID da tarefa é obrigatório.');
          const updated = await tasksService.updateTask(args.task_id, {
            title: args.title,
            due_date: args.due_date,
            priority: args.priority,
            status: args.status,
          });
          resultData = updated;
          message = `✓ Tarefa atualizada.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['tasks'] });
          break;
        }

        case 'complete_task': {
          if (!args.task_id) throw new Error('ID da tarefa é obrigatório.');
          const updated = await tasksService.toggleTaskStatus(args.task_id, 'pending');
          resultData = updated;
          message = `✓ Tarefa marcada como concluída.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['tasks'] });
          break;
        }

        case 'delete_task': {
          if (!args.task_id) throw new Error('ID da tarefa é obrigatório.');
          await tasksService.deleteTask(args.task_id);
          message = `✓ Tarefa eliminada.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['tasks'] });
          break;
        }

        case 'list_tasks': {
          const tasks = await tasksService.getTasks();
          resultData = tasks;
          if (tasks.length === 0) {
            message = 'Não tens tarefas registadas no momento. Diz-me o que queres fazer que eu crio para ti!';
          } else {
            const pending = tasks.filter((t) => t.status !== 'completed');
            const completed = tasks.filter((t) => t.status === 'completed');
            const lines: string[] = [`📋 **As tuas Tarefas (${tasks.length} no total):**`];
            if (pending.length > 0) {
              lines.push(`\n⏳ **Pendentes (${pending.length}):**`);
              pending.slice(0, 10).forEach((t, idx) => {
                const prioBadge = t.priority === 'urgent' ? '🔥 [Urgente]' : t.priority === 'high' ? '⚠️ [Alta]' : '';
                const due = t.due_date ? ` (Prazo: ${new Date(t.due_date).toLocaleDateString('pt-PT')})` : '';
                lines.push(`${idx + 1}. **${t.title}** ${prioBadge}${due}`);
              });
              if (pending.length > 10) lines.push(`*...e mais ${pending.length - 10} tarefas pendentes.*`);
            }
            if (completed.length > 0) {
              lines.push(`\n✅ **Concluídas recentemente (${completed.length}):**`);
              completed.slice(0, 5).forEach((t, idx) => {
                lines.push(`${idx + 1}. ~~${t.title}~~`);
              });
            }
            message = lines.join('\n');
          }
          break;
        }

        // --- AGENDA / EVENTS (4 Tools) ---
        case 'create_event': {
          const startTime = args.start_time || new Date().toISOString();
          const endTime = args.end_time || new Date(Date.now() + 3600000).toISOString();
          const event = await eventsService.createEvent({
            title: args.title,
            description: args.description ?? null,
            location: args.location ?? null,
            start_time: startTime,
            end_time: endTime,
          });
          resultData = event;
          message = `✓ Evento "${event.title}" adicionado à agenda.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['events'] });
          break;
        }

        case 'update_event': {
          if (!args.event_id) throw new Error('ID do evento é obrigatório.');
          const updated = await eventsService.updateEvent(args.event_id, {
            title: args.title,
            start_time: args.start_time,
            end_time: args.end_time,
            location: args.location,
          });
          resultData = updated;
          message = `✓ Evento atualizado na agenda.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['events'] });
          break;
        }

        case 'delete_event': {
          if (!args.event_id) throw new Error('ID do evento é obrigatório.');
          await eventsService.deleteEvent(args.event_id);
          message = `✓ Evento removido da agenda.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['events'] });
          break;
        }

        case 'list_events': {
          const events = await eventsService.getEvents();
          resultData = events;
          if (events.length === 0) {
            message = 'Não tens compromissos agendados na tua agenda.';
          } else {
            const lines: string[] = [`📅 **Compromissos na Agenda (${events.length}):**`];
            events.slice(0, 10).forEach((e, idx) => {
              const start = e.start_time ? new Date(e.start_time).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }) : 'Sem hora';
              const loc = e.location ? ` (Local: ${e.location})` : '';
              lines.push(`${idx + 1}. 🕒 **${e.title}** — ${start}${loc}`);
            });
            if (events.length > 10) lines.push(`*...e mais ${events.length - 10} eventos agendados.*`);
            message = lines.join('\n');
          }
          break;
        }

        // --- LISTS (5 Tools) ---
        case 'create_list': {
          const list = await listsService.createList({
            title: args.title,
            category: args.category ?? null,
          });
          resultData = list;
          message = `✓ Lista "${list.title}" criada.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['lists'] });
          break;
        }

        case 'add_list_item': {
          if (!args.list_id || !args.content) throw new Error('ID da lista e conteúdo são obrigatórios.');
          const item = await listsService.addListItem({
            list_id: args.list_id,
            content: args.content,
          });
          resultData = item;
          message = `✓ Item "${item.content}" adicionado à lista.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['lists'] });
          break;
        }

        case 'update_list_item': {
          if (!args.item_id) throw new Error('ID do item é obrigatório.');
          const item = await listsService.toggleListItem(args.item_id, !args.is_completed);
          resultData = item;
          message = `✓ Item da lista atualizado.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['lists'] });
          break;
        }

        case 'delete_list_item': {
          if (!args.item_id) throw new Error('ID do item é obrigatório.');
          await listsService.deleteListItem(args.item_id);
          message = `✓ Item removido da lista.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['lists'] });
          break;
        }

        case 'list_lists': {
          const lists = await listsService.getLists();
          resultData = lists;
          if (lists.length === 0) {
            message = 'Não tens nenhuma lista criada no momento.';
          } else {
            const lines: string[] = [`📝 **As tuas Listas (${lists.length}):**`];
            for (let i = 0; i < Math.min(lists.length, 6); i++) {
              const l = lists[i];
              const items = await listsService.getListItems(l.id).catch(() => []);
              const itemsCount = items.length;
              lines.push(`\n${i + 1}. 📑 **${l.title}** (${itemsCount} itens)${l.category ? ` [${l.category}]` : ''}`);
              if (items.length > 0) {
                items.slice(0, 4).forEach((it) => {
                  lines.push(`   - ${it.is_completed ? '✅' : '◻️'} ${it.content}`);
                });
                if (items.length > 4) lines.push(`   - *...e mais ${items.length - 4} itens*`);
              }
            }
            message = lines.join('\n');
          }
          break;
        }

        // --- GOALS (4 Tools) ---
        case 'create_goal': {
          const goal = await goalsService.createGoal({
            title: args.title,
            target_value: args.target_value ?? 100,
            unit: args.unit ?? '%',
            deadline: args.deadline ?? null,
          });
          resultData = goal;
          message = `✓ Meta "${goal.title}" criada.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['goals'] });
          break;
        }

        case 'update_goal': {
          if (!args.goal_id) throw new Error('ID da meta é obrigatório.');
          const updated = await goalsService.updateGoal(args.goal_id, {
            title: args.title,
            target_value: args.target_value,
            unit: args.unit,
          });
          resultData = updated;
          message = `✓ Meta atualizada.`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['goals'] });
          break;
        }

        case 'update_goal_progress': {
          if (!args.goal_id) throw new Error('ID da meta é obrigatório.');
          const updated = await goalsService.updateProgress(
            args.goal_id,
            args.current_value,
            args.target_value ?? 100
          );
          resultData = updated;
          message = `✓ Progresso da meta atualizado (${args.current_value}).`;
          if (this.queryClient) this.queryClient.invalidateQueries({ queryKey: ['goals'] });
          break;
        }

        case 'list_goals': {
          const goals = await goalsService.getGoals();
          resultData = goals;
          if (goals.length === 0) {
            message = 'Não tens metas ou objetivos registados no momento.';
          } else {
            const lines: string[] = [`🎯 **As tuas Metas & Objetivos (${goals.length}):**`];
            goals.forEach((g, idx) => {
              const pct = g.target_value ? Math.round(((g.current_value || 0) / g.target_value) * 100) : 0;
              const unit = g.unit || '%';
              const deadline = g.deadline ? ` (Prazo: ${new Date(g.deadline).toLocaleDateString('pt-PT')})` : '';
              lines.push(`${idx + 1}. 🚀 **${g.title}**: ${g.current_value || 0}/${g.target_value || 100} ${unit} (${pct}%)${deadline}`);
            });
            message = lines.join('\n');
          }
          break;
        }

        // --- LEARNING (6 Tools) ---
        case 'generate_learning_course': {
          const obj = await learningService.createObjective({
            title: args.title,
            description: args.description ?? 'Curso gerado pelo Assistente NEXO',
          });

          let totalTopics = 0;
          if (Array.isArray(args.stages)) {
            for (let i = 0; i < args.stages.length; i++) {
              const stage = args.stages[i];
              if (!stage.stage_title) continue;
              const plan = await learningService.createPlan({
                objective_id: obj.id,
                title: stage.stage_title,
                order_index: i,
              });

              if (Array.isArray(stage.topics)) {
                for (const topicTitle of stage.topics) {
                  if (!topicTitle) continue;
                  await learningService.addItem({
                    plan_id: plan.id,
                    title: topicTitle,
                    is_completed: false,
                  });
                  totalTopics++;
                }
              }
            }
          }

          resultData = obj;
          message = `🎓 Curso "${obj.title}" gerado e lançado com sucesso na aba Aprender com ${args.stages?.length || 0} etapas e ${totalTopics} módulos práticos!`;
          if (this.queryClient) {
            this.queryClient.invalidateQueries({ queryKey: ['learning_objectives'] });
            this.queryClient.invalidateQueries({ queryKey: ['learning_plans'] });
            this.queryClient.invalidateQueries({ queryKey: ['learning_items'] });
          }
          break;
        }

        case 'create_learning_objective': {
          const obj = await learningService.createObjective({
            title: args.title,
            description: args.description ?? null,
          });
          resultData = obj;
          message = `✓ Objectivo de aprendizagem "${obj.title}" criado com sucesso.`;
          if (this.queryClient) {
            this.queryClient.invalidateQueries({ queryKey: ['learning_objectives'] });
          }
          break;
        }

        case 'create_learning_plan': {
          let objectiveId = args.objective_id;
          if (!objectiveId) {
            const objectives = await learningService.getObjectives().catch(() => []);
            if (objectives.length > 0) {
              objectiveId = objectives[0].id;
            } else {
              const newObj = await learningService.createObjective({
                title: args.title || 'Plano de Estudo',
                description: 'Criado pelo Assistente NEXO',
              });
              objectiveId = newObj.id;
            }
          }
          const plan = await learningService.createPlan({
            objective_id: objectiveId,
            title: args.title,
          });
          resultData = plan;
          message = `✓ Plano de estudo "${plan.title}" criado.`;
          if (this.queryClient) {
            this.queryClient.invalidateQueries({ queryKey: ['learning_objectives'] });
            this.queryClient.invalidateQueries({ queryKey: ['learning_plans'] });
          }
          break;
        }

        case 'add_learning_item': {
          if (!args.plan_id || !args.title) throw new Error('ID do plano e título do tópico são obrigatórios.');
          const item = await learningService.addItem({
            plan_id: args.plan_id,
            title: args.title,
          });
          resultData = item;
          message = `✓ Tópico de estudo "${item.title}" adicionado.`;
          if (this.queryClient) {
            this.queryClient.invalidateQueries({ queryKey: ['learning_items'] });
            this.queryClient.invalidateQueries({ queryKey: ['learning_objectives'] });
          }
          break;
        }

        case 'complete_learning_item': {
          if (!args.item_id) throw new Error('ID do item de aprendizagem é obrigatório.');
          const item = await learningService.toggleItem(args.item_id, false);
          resultData = item;
          message = `✓ Tópico de estudo concluído.`;
          if (this.queryClient) {
            this.queryClient.invalidateQueries({ queryKey: ['learning_items'] });
            this.queryClient.invalidateQueries({ queryKey: ['learning_objectives'] });
          }
          break;
        }

        case 'list_learning': {
          const objectives = await learningService.getObjectives();
          resultData = objectives;
          if (objectives.length === 0) {
            message = 'Ainda não tens cursos ou temas de estudo registados na aba Aprender. Pede-me para criar um curso (ex: "Cria um curso completo de Inglês")!';
          } else {
            const courseDetails: string[] = [];
            for (let i = 0; i < objectives.length; i++) {
              const obj = objectives[i];
              const plans = await learningService.getPlans(obj.id);
              let plansText = '';
              if (plans.length > 0) {
                const planLines: string[] = [];
                for (let j = 0; j < plans.length; j++) {
                  const p = plans[j];
                  const items = await learningService.getItems(p.id);
                  let itemsText = '';
                  if (items.length > 0) {
                    itemsText = '\n' + items.map((it) => `      ${it.is_completed ? '✅' : '⏳'} ${it.title}`).join('\n');
                  }
                  planLines.push(`   📌 **Etapa/Módulo ${j + 1}: ${p.title}**${itemsText}`);
                }
                plansText = `\n${planLines.join('\n')}`;
              } else {
                plansText = '\n   *(Sem etapas ou módulos definidos ainda)*';
              }
              courseDetails.push(
                `📚 **${i + 1}. ${obj.title}** (Progresso: ${obj.progress_percent || 0}%)\n   ${obj.description ? `*${obj.description}*\n` : ''}${plansText}`
              );
            }
            message = `Aqui estão os teus temas e módulos na aba **Aprender** (${objectives.length}):\n\n${courseDetails.join('\n\n')}`;
          }
          break;
        }

        // --- INFO (2 Tools) ---
        case 'get_today_summary': {
          const tasks = await tasksService.getTasks();
          const events = await eventsService.getEvents();
          const todayStr = new Date().toISOString().split('T')[0];
          const todayTasks = tasks.filter((t) => t.status !== 'completed' && t.due_date?.startsWith(todayStr));
          const todayEvents = events.filter((e) => e.start_time.startsWith(todayStr));
          resultData = { tasks: todayTasks, events: todayEvents };

          const lines: string[] = [`📊 **Resumo de Hoje (${new Date().toLocaleDateString('pt-PT')}):**`];
          lines.push(`\n📋 **Tarefas para Hoje (${todayTasks.length}):**`);
          if (todayTasks.length === 0) {
            lines.push('   *(Nenhuma tarefa agendada especificamente para hoje)*');
          } else {
            todayTasks.forEach((t, i) => lines.push(`   ${i + 1}. ⏳ **${t.title}**`));
          }

          lines.push(`\n📅 **Compromissos de Hoje (${todayEvents.length}):**`);
          if (todayEvents.length === 0) {
            lines.push('   *(Nenhum compromisso marcado na agenda para hoje)*');
          } else {
            todayEvents.forEach((e, i) => {
              const time = new Date(e.start_time).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
              lines.push(`   ${i + 1}. 🕒 **${time}** — ${e.title}`);
            });
          }

          message = lines.join('\n');
          break;
        }

        case 'get_upcoming_items': {
          const tasks = await tasksService.getTasks();
          const events = await eventsService.getEvents();
          const pendingTasks = tasks.filter((t) => t.status !== 'completed');
          resultData = { upcomingTasks: pendingTasks.slice(0, 5), upcomingEvents: events.slice(0, 5) };
          message = `Próximos itens agendados carregados com sucesso.`;
          break;
        }

        // --- PILOTO AUTOMÁTICO (1 Tool) ---
        case 'execute_workflow': {
          const actionsList = Array.isArray(args.actions) ? args.actions : [];
          const executedSummaries: string[] = [];

          for (const item of actionsList) {
            if (!item.action_type || !item.args) continue;
            try {
              const subResult = await this.executeTool(item.action_type, item.args, conversationId);
              if (subResult.result_message) {
                executedSummaries.push(subResult.result_message);
              }
            } catch (subErr) {
              console.warn(`[Workflow SubAction ${item.action_type} Warning]`, subErr);
            }
          }

          resultData = { total_executed: executedSummaries.length };
          message = `⚡ **Piloto Automático — ${args.workflow_title || 'Fluxo Executado'}**:\n` + executedSummaries.map((s) => `• ${s}`).join('\n');
          break;
        }

        case 'save_user_memory': {
          const memory = aiMemoryService.saveMemory({
            category: args.category || 'preference',
            key: args.key,
            value: args.value,
          });
          resultData = memory;
          message = `🧠 Guardado na memória de longo prazo: "${memory.key}"`;
          break;
        }

        default:
          throw new Error(`Ferramenta não reconhecida ou não suportada: ${actionType}`);
      }

      // Trigger visual pulse on corresponding NEXO tab
      const tabMapping: Record<string, string> = {
        create_task: '/app',
        update_task: '/app',
        complete_task: '/app',
        delete_task: '/app',
        create_event: '/app/calendar',
        update_event: '/app/calendar',
        delete_event: '/app/calendar',
        create_list: '/app/lists',
        add_list_item: '/app/lists',
        create_goal: '/app/goals',
        update_goal_progress: '/app/goals',
        generate_learning_course: '/app/learning',
        create_learning_objective: '/app/learning',
      };
      if (tabMapping[actionType]) {
        pulseNexoTab(tabMapping[actionType]);
      }
    } catch (err: any) {
      success = false;
      message = err?.message || 'Erro ao executar acção da IA';
    }

    // Log action to ai_actions_log table safely
    if (user?.id) {
      try {
        const validConvId = conversationId && !conversationId.startsWith('guest-') ? conversationId : null;
        await (supabase as any).from('ai_actions_log').insert({
          conversation_id: validConvId,
          user_id: user.id,
          action_type: actionType,
          payload: args,
          status: success ? 'executed' : 'failed',
        });
      } catch (logErr) {
        // Silent catch for database log insert errors
      }
    }

    return {
      success,
      action_type: actionType,
      result_message: message,
      data: resultData,
    };
  }
}

export const aiToolExecutor = new AIToolExecutor();
