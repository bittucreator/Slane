/**
 * @author Shiva Nagendra Babu Kore
 */

'use client'

import { TasksPageFull } from '../../components/TasksPageFull';
import { useRequireAuth } from '../../hooks/useAuthRedirect';

export default function Tasks() {
  useRequireAuth(); // Still need auth but don't use loading state

  // Always show the TasksPageFull component with no loading UI
  return <TasksPageFull />;
}
