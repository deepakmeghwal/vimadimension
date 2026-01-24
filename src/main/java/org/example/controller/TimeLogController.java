package org.example.controller;

import org.example.dto.TimeLogDto;
import org.example.models.Task;
import org.example.models.TimeLog;
import org.example.service.TaskService;
import org.example.service.TimeLogService;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
// import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.http.ResponseEntity;

import java.util.List;

@Controller
@RequestMapping("/timelogs") // Base path for time log operations
public class TimeLogController {

    private static final Logger logger = LoggerFactory.getLogger(TimeLogController.class);

    private final TimeLogService timeLogService;
    private final TaskService taskService; // To get task context

    @Autowired
    public TimeLogController(TimeLogService timeLogService, TaskService taskService) {
        this.timeLogService = timeLogService;
        this.taskService = taskService;
    }

    // --- Show form to log time for a task ---
    @GetMapping("/task/{taskId}/new")
    @PreAuthorize("hasAuthority('timeentries.create')")
    public String showLogTimeForm(@PathVariable Long taskId, Model model) {
        Task task = taskService.findTaskById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));

        TimeLogDto timeLogDto = new TimeLogDto();
        timeLogDto.setTaskId(taskId); // Pre-populate task ID

        model.addAttribute("timeLogDto", timeLogDto);
        model.addAttribute("task", task);
        return "tasks/timelog-form"; // Path to your Thymeleaf template
    }

    // --- Process time log submission ---
    @PostMapping("/task/{taskId}/log")
    @PreAuthorize("hasAuthority('timeentries.create')")
    public String logTime(@PathVariable Long taskId,
                          // @Valid @ModelAttribute("timeLogDto") TimeLogDto timeLogDto, // Uncomment for validation
                          @ModelAttribute("timeLogDto") TimeLogDto timeLogDto,
                          BindingResult result,
                          RedirectAttributes redirectAttributes,
                          Model model) {

        Task task = taskService.findTaskById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));

        // Ensure the DTO's task ID matches the path variable for consistency
        if (!taskId.equals(timeLogDto.getTaskId())) {
            // This case should ideally not happen if the form is set up correctly
            redirectAttributes.addFlashAttribute("errorMessage", "Task ID mismatch.");
            return "redirect:/tasks/" + taskId + "/details";
        }

        if (result.hasErrors()) {
            logger.warn("Validation errors while logging time for task ID {}: {}", taskId, result.getAllErrors());
            model.addAttribute("task", task);
            // model.addAttribute("timeLogDto", timeLogDto); // Already added by @ModelAttribute
            return "tasks/timelog-form";
        }

        try {
            timeLogService.logTime(timeLogDto);
            redirectAttributes.addFlashAttribute("successMessage", "Time logged successfully!");
            return "redirect:/tasks/" + taskId + "/details"; // Redirect to task details
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Error logging time for task ID {}: {}", taskId, e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            model.addAttribute("task", task);
            // model.addAttribute("timeLogDto", timeLogDto);
            return "tasks/timelog-form";
        }
    }

    // --- View/Edit a specific time log (Optional - often managed within task view) ---
    @GetMapping("/{timeLogId}/edit")
    @PreAuthorize("hasAuthority('timeentries.edit')")
    public String showEditTimeLogForm(@PathVariable Long timeLogId, Model model, RedirectAttributes redirectAttributes) {
        TimeLog timeLog = timeLogService.findTimeLogById(timeLogId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid time log ID: " + timeLogId));

        // Authorization check: Ensure current user owns this time log
        // This logic is also in the service, but an early check here can be good.
        // For simplicity, relying on service-layer check for now.

        TimeLogDto timeLogDto = new TimeLogDto();
        timeLogDto.setTaskId(timeLog.getTask().getId());
        timeLogDto.setDateLogged(timeLog.getDateLogged());
        timeLogDto.setHoursLogged(timeLog.getHoursLogged());
        timeLogDto.setWorkDescription(timeLog.getWorkDescription());

        model.addAttribute("timeLogDto", timeLogDto);
        model.addAttribute("timeLog", timeLog); // For context, like timeLogId
        model.addAttribute("task", timeLog.getTask());
        return "timelogs/timelog-edit-form";
    }

    @PostMapping("/{timeLogId}/update")
    @PreAuthorize("hasAuthority('timeentries.edit')")
    public String updateTimeLog(@PathVariable Long timeLogId,
                                // @Valid @ModelAttribute("timeLogDto") TimeLogDto timeLogDto, // Uncomment for validation
                                @ModelAttribute("timeLogDto") TimeLogDto timeLogDto,
                                BindingResult result,
                                RedirectAttributes redirectAttributes,
                                Model model) {

        TimeLog originalTimeLog = timeLogService.findTimeLogById(timeLogId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid time log ID: " + timeLogId));

        if (result.hasErrors()) {
            logger.warn("Validation errors while updating time log ID {}: {}", timeLogId, result.getAllErrors());
            model.addAttribute("timeLog", originalTimeLog);
            model.addAttribute("task", originalTimeLog.getTask());
            return "timelogs/timelog-edit-form";
        }

        try {
            timeLogService.updateTimeLog(timeLogId, timeLogDto);
            redirectAttributes.addFlashAttribute("successMessage", "Time log updated successfully!");
            return "redirect:/tasks/" + originalTimeLog.getTask().getId() + "/details"; // Redirect to task details
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Error updating time log ID {}: {}", timeLogId, e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", e.getMessage());
            model.addAttribute("timeLog", originalTimeLog);
            model.addAttribute("task", originalTimeLog.getTask());
            return "timelogs/timelog-edit-form";
        }
    }


    // --- Delete a time log ---
    @PostMapping("/{timeLogId}/delete")
    @PreAuthorize("hasAuthority('timeentries.delete')")
    public String deleteTimeLog(@PathVariable Long timeLogId, RedirectAttributes redirectAttributes) {
        TimeLog timeLog = timeLogService.findTimeLogById(timeLogId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid time log ID: " + timeLogId));
        Long taskId = timeLog.getTask().getId(); // For redirect

        try {
            timeLogService.deleteTimeLog(timeLogId);
            redirectAttributes.addFlashAttribute("successMessage", "Time log deleted successfully.");
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Error deleting time log ID {}: {}", timeLogId, e.getMessage());
            redirectAttributes.addFlashAttribute("errorMessage", "Could not delete time log: " + e.getMessage());
        }
        return "redirect:/tasks/" + taskId + "/details"; // Redirect to task details
    }


    // --- List time logs for a task (often part of task details view) ---
    @GetMapping("/task/{taskId}")
    @PreAuthorize("hasAuthority('timeentries.view')")
    public String listTimeLogsForTask(@PathVariable Long taskId, Model model) {
        Task task = taskService.findTaskById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid task ID: " + taskId));
        List<TimeLog> timeLogs = timeLogService.getTimeLogsForTask(taskId);

        model.addAttribute("task", task);
        model.addAttribute("timeLogs", timeLogs);
        return "timelogs/timelog-list"; // Or integrate into task-details.html
    }

}